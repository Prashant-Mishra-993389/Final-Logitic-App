// js/modules/dynamicForm/fieldTypes.js — Render individual dynamic field types
export function renderField(field, value = '') {
  switch (field.fieldType) {
    case 'text':
    case 'number':
    case 'date':
      return `<input id="df_${field.fieldKey}" name="${field.fieldKey}" type="${field.fieldType}"
        value="${value}" placeholder="${field.placeholder||''}"
        ${field.required?'required':''} ${field.min!==undefined?`min="${field.min}"`:''}
        ${field.max!==undefined?`max="${field.max}"`:''}
        class="df-input" />
        ${field.unit ? `<span style="color:#64748b;font-size:0.8rem;margin-top:4px;display:block;">${field.unit}</span>` : ''}`;

    case 'textarea':
      return `<textarea id="df_${field.fieldKey}" name="${field.fieldKey}" rows="3"
        placeholder="${field.placeholder||''}" ${field.required?'required':''}
        class="df-input" style="resize:vertical;">${value}</textarea>`;

    case 'select':
      return `<select id="df_${field.fieldKey}" name="${field.fieldKey}" ${field.required?'required':''} class="df-input" style="cursor:pointer;">
        <option value="">-- ${field.placeholder||'Select an option'} --</option>
        ${(field.options||[]).map(o => `<option value="${o.value||o}" ${value===(o.value||o)?'selected':''}>${o.label||o}</option>`).join('')}
      </select>`;

    case 'multiselect':
      return `<div id="df_${field.fieldKey}" style="display:flex;flex-wrap:wrap;gap:8px;">
        ${(field.options||[]).map(o => {
          const v = o.value||o; const l = o.label||o;
          const checked = Array.isArray(value) ? value.includes(v) : false;
          return `<label style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:7px;cursor:pointer;font-size:0.82rem;color:#94a3b8;">
            <input type="checkbox" name="${field.fieldKey}" value="${v}" ${checked?'checked':''} style="accent-color:#f59e0b;" />${l}
          </label>`;
        }).join('')}
      </div>`;

    case 'boolean':
      return `<label class="df-toggle" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 0;">
        <div style="position:relative;width:44px;height:24px;">
          <input type="checkbox" id="df_${field.fieldKey}" name="${field.fieldKey}" ${value?'checked':''} 
            style="opacity:0;width:0;height:0;position:absolute;" />
          <div style="position:absolute;inset:0;background:rgba(255,255,255,0.1);border-radius:12px;transition:background 0.2s;">
            <span style="position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:left 0.2s;"></span>
          </div>
        </div>
        <span style="color:#94a3b8;font-size:0.875rem;">${field.placeholder||'Yes / No'}</span>
      </label>`;

    case 'file':
      return `<div class="df-file-wrapper" style="border:2px dashed rgba(255,255,255,0.1);border-radius:10px;padding:1.25rem;text-align:center;background:rgba(255,255,255,0.02);">
        <input type="file" id="df_${field.fieldKey}" name="${field.fieldKey}" style="display:none;" ${field.required?'required':''} />
        <label for="df_${field.fieldKey}" style="
          display:inline-block;padding:8px 18px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);
          border-radius:7px;color:#f59e0b;cursor:pointer;font-size:0.82rem;font-family:inherit;
        ">📂 Choose File</label>
        <div id="df_${field.fieldKey}_name" class="df-filename" style="color:#64748b;font-size:0.75rem;margin-top:6px;">No file chosen</div>
      </div>`;

    default:
      return `<input id="df_${field.fieldKey}" name="${field.fieldKey}" type="text" value="${value}" class="df-input" />`;
  }
}

export function getFieldValue(field) {
  if (field.fieldType === 'multiselect') {
    return Array.from(document.querySelectorAll(`input[name="${field.fieldKey}"]:checked`)).map(i => i.value);
  }
  if (field.fieldType === 'boolean') {
    return document.getElementById(`df_${field.fieldKey}`)?.checked || false;
  }
  return document.getElementById(`df_${field.fieldKey}`)?.value || '';
}
