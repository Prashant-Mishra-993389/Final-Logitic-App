// js/components/search.js — Search input component
import { debounce } from '../utils/debounce.js';

export function SearchInput({ placeholder = 'Search...', onSearch, delay = 350 }) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;';
  wrapper.innerHTML = `
    <span style="position:absolute;left:10px;color:#64748b;font-size:0.9rem;">🔍</span>
    <input id="search-input" type="text" placeholder="${placeholder}" style="
      padding:8px 12px 8px 32px;background:#1a1d27;border:1px solid rgba(255,255,255,0.08);
      border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;
      transition:border-color 0.2s;width:260px;font-family:Inter,sans-serif;
    " />
  `;
  const input = wrapper.querySelector('#search-input');
  input.addEventListener('focus', () => input.style.borderColor = 'rgba(245,158,11,0.4)');
  input.addEventListener('blur', () => input.style.borderColor = 'rgba(255,255,255,0.08)');
  const handler = debounce((e) => onSearch(e.target.value.trim()), delay);
  input.addEventListener('input', handler);
  return wrapper;
}

export function FilterSelect({ label, options, onChange }) {
  const sel = document.createElement('select');
  sel.style.cssText = `
    padding:8px 12px;background:#1a1d27;border:1px solid rgba(255,255,255,0.08);
    border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;cursor:pointer;
    font-family:Inter,sans-serif;
  `;
  sel.innerHTML = `<option value="">${label || 'All'}</option>` +
    options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
  sel.addEventListener('change', () => onChange(sel.value));
  return sel;
}
