// js/components/otpInput.js — 6-digit OTP input component
export function OtpInput(containerId, onComplete) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div id="otp-boxes" style="display:flex;gap:10px;justify-content:center;">
      ${Array.from({length:6}, (_,i) => `
        <input 
          type="text" maxlength="1" data-idx="${i}"
          style="
            width:52px;height:60px;text-align:center;font-size:1.5rem;font-weight:700;
            background:#1a1d27;border:2px solid rgba(255,255,255,0.1);border-radius:10px;
            color:#f1f5f9;outline:none;transition:all 0.2s;font-family:JetBrains Mono,monospace;
          "
        />
      `).join('')}
    </div>
  `;

  const inputs = container.querySelectorAll('input');

  inputs.forEach((inp, i) => {
    inp.addEventListener('focus', () => inp.style.borderColor = '#f59e0b');
    inp.addEventListener('blur',  () => inp.style.borderColor = 'rgba(255,255,255,0.1)');

    inp.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g,'');
      inp.value = val.slice(-1);
      if (val && i < 5) inputs[i+1].focus();
      checkComplete();
    });

    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i-1].focus();
      if (e.key === 'ArrowLeft'  && i > 0) inputs[i-1].focus();
      if (e.key === 'ArrowRight' && i < 5) inputs[i+1].focus();
    });

    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
      text.split('').forEach((ch, j) => { if (inputs[j]) inputs[j].value = ch; });
      if (text.length === 6) { inputs[5].focus(); checkComplete(); }
    });
  });

  function checkComplete() {
    const otp = Array.from(inputs).map(i => i.value).join('');
    if (otp.length === 6) onComplete(otp);
  }

  return {
    getValue: () => Array.from(inputs).map(i => i.value).join(''),
    clear: () => { inputs.forEach(i => { i.value=''; i.style.borderColor='rgba(255,255,255,0.1)'; }); inputs[0].focus(); },
    setError: () => inputs.forEach(i => i.style.borderColor='#ef4444'),
  };
}
