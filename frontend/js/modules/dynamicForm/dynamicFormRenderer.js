// js/modules/dynamicForm/dynamicFormRenderer.js
import { API } from '../../core/api.js';
import { renderField, getFieldValue } from './fieldTypes.js';
import { bindConditionalLogic } from './conditionalLogic.js';
import { Loader } from '../../components/loader.js';

export async function renderDynamicForm(container, subcategoryId, existingValues = {}) {
  if (!subcategoryId) { container.innerHTML = ''; return []; }
  container.innerHTML = `<div style="padding:1rem;">${Loader.skeleton(3)}</div>`;

  const res = await API.get(`/requirements/subcategory/${subcategoryId}`, { silent: true });
  const fields = res.fields || res.data || res || [];

  if (!fields.length) {
    container.innerHTML = '<div style="color:#64748b;font-size:0.85rem;padding:0.5rem 0;">No additional fields required for this subcategory.</div>';
    return [];
  }

  container.innerHTML = fields.map(field => `
    <div data-field="${field.fieldKey}" style="margin-bottom:1rem;">
      <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">
        ${field.label}${field.required?'<span style="color:#ef4444;margin-left:2px;">*</span>':''}
      </label>
      ${renderField(field, existingValues[field.fieldKey])}
      ${field.helpText ? `<div style="margin-top:4px;font-size:0.75rem;color:#64748b;">${field.helpText}</div>` : ''}
    </div>
  `).join('');

  bindConditionalLogic(fields, container);

  // Bind file inputs to show filename securely without inline scripts
  container.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const nameEl = document.getElementById(e.target.id + '_name');
      if (nameEl) nameEl.textContent = e.target.files[0]?.name || 'No file chosen';
    });
  });

  return fields;
}

export function collectDynamicValues(fields) {
  const data = {};
  fields.forEach(f => { data[f.fieldKey] = getFieldValue(f); });
  return data;
}
