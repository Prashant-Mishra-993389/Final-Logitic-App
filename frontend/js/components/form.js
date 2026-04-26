// js/components/form.js — Form field renderer helpers
import { showFieldError, clearFieldError } from '../utils/validation.js';

const inputBase = `
  width:100%;padding:10px 12px;background:#1a1d27;
  border:1px solid rgba(255,255,255,0.08);border-radius:9px;
  color:#f1f5f9;font-size:0.875rem;outline:none;transition:border-color 0.2s;
  font-family:Inter,sans-serif;
`;

export function FormField({ label, required, helpText, error, input }) {
  return `<div style="margin-bottom:1rem;">
    ${label ? `<label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">
      ${label}${required ? '<span style="color:#ef4444;margin-left:2px;">*</span>' : ''}
    </label>` : ''}
    ${input}
    ${helpText ? `<div style="margin-top:4px;font-size:0.75rem;color:#64748b;">${helpText}</div>` : ''}
    ${error ? `<div class="field-error" style="margin-top:4px;font-size:0.75rem;color:#ef4444;">${error}</div>` : ''}
  </div>`;
}

export function TextInput({ id, name, type = 'text', value = '', placeholder = '', required = false, min, max }) {
  return `<input id="${id}" name="${name||id}" type="${type}" value="${value}" placeholder="${placeholder}" ${required?'required':''} ${min?`min="${min}"`:''}  ${max?`max="${max}"`:''}
    style="${inputBase}" 
    onfocus="this.style.borderColor='rgba(245,158,11,0.4)'" 
    onblur="this.style.borderColor='rgba(255,255,255,0.08)'"
  />`;
}

export function SelectInput({ id, name, options = [], value = '', required = false, placeholder = 'Select...' }) {
  const opts = [`<option value="">${placeholder}</option>`,
    ...options.map(o => `<option value="${o.value||o}" ${value===String(o.value||o)?'selected':''}>${o.label||o}</option>`)
  ].join('');
  return `<select id="${id}" name="${name||id}" ${required?'required':''} style="${inputBase}background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 10px center;appearance:none;padding-right:30px;cursor:pointer;"
    onfocus="this.style.borderColor='rgba(245,158,11,0.4)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'"
  >${opts}</select>`;
}

export function TextareaInput({ id, name, value = '', placeholder = '', rows = 4, required = false }) {
  return `<textarea id="${id}" name="${name||id}" rows="${rows}" placeholder="${placeholder}" ${required?'required':''}
    style="${inputBase}resize:vertical;" 
    onfocus="this.style.borderColor='rgba(245,158,11,0.4)'" 
    onblur="this.style.borderColor='rgba(255,255,255,0.08)'"
  >${value}</textarea>`;
}

export function SubmitBtn({ label = 'Submit', id = 'submit-btn', full = false, variant = 'primary' }) {
  const styles = {
    primary: 'background:#f59e0b;color:#0d0f14;',
    danger:  'background:#ef4444;color:#fff;',
    ghost:   'background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.1);',
  };
  return `<button id="${id}" type="submit" style="
    ${styles[variant]||styles.primary}
    padding:11px 24px;border:none;border-radius:9px;font-weight:700;font-size:0.875rem;
    cursor:pointer;transition:all 0.2s;${full?'width:100%;':''}
    font-family:Inter,sans-serif;
  " onmouseenter="this.style.opacity='0.9'" onmouseleave="this.style.opacity='1'">${label}</button>`;
}

export function setButtonLoading(btnEl, loading, originalText) {
  if (!btnEl) return;
  if (loading) {
    btnEl._orig = btnEl.textContent;
    btnEl.disabled = true;
    btnEl.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(0,0,0,0.3);border-top-color:#0d0f14;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:6px;"></span>Loading...`;
  } else {
    btnEl.disabled = false;
    btnEl.textContent = originalText || btnEl._orig || 'Submit';
  }
}
