// js/components/ratingStars.js — Star rating component
export function RatingStars(rating = 0, max = 5, size = 16) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  const star = (type) => {
    const colors = { full:'#f59e0b', half:'#f59e0b', empty:'#334155' };
    const icons  = { full:'★', half:'⯨', empty:'☆' };
    return `<span style="color:${colors[type]};font-size:${size}px;line-height:1;">${icons[type]}</span>`;
  };
  return `<span style="display:inline-flex;align-items:center;gap:1px;">
    ${''.padStart(full,'x').split('').map(()=>star('full')).join('')}
    ${''.padStart(half,'x').split('').map(()=>star('half')).join('')}
    ${''.padStart(empty,'x').split('').map(()=>star('empty')).join('')}
    <span style="color:#64748b;font-size:${size-2}px;margin-left:4px;">${Number(rating).toFixed(1)}</span>
  </span>`;
}

export function InteractiveRating({ id, onRate }) {
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:center;';
  let selected = 0;

  div.innerHTML = Array.from({length:5}, (_,i) => `
    <button type="button" data-val="${i+1}" style="
      background:none;border:none;cursor:pointer;font-size:1.8rem;
      color:#334155;transition:color 0.1s;padding:2px;line-height:1;
    ">★</button>
  `).join('') + `<input type="hidden" id="${id}" name="${id}" value="${selected}"/>`;

  const buttons = div.querySelectorAll('button');
  const updateStars = (val) => {
    buttons.forEach((btn, i) => {
      btn.style.color = i < val ? '#f59e0b' : '#334155';
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => updateStars(+btn.dataset.val));
    btn.addEventListener('mouseleave', () => updateStars(selected));
    btn.addEventListener('click', () => { 
      selected = +btn.dataset.val; 
      updateStars(selected); 
      const input = div.querySelector('input');
      if (input) input.value = selected;
      onRate?.(selected); 
    });
  });

  return div;
}
