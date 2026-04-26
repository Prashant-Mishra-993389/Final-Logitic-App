// js/modules/dynamicForm/conditionalLogic.js
export function evaluateCondition(field, formData) {
  if (!field.dependsOn || !field.dependsOn.fieldKey) return true;
  const { fieldKey, value } = field.dependsOn;
  const current = formData[fieldKey];
  if (Array.isArray(current)) return current.includes(value);
  return String(current) === String(value);
}

export function bindConditionalLogic(fields, container) {
  function refresh() {
    const data = {};
    fields.forEach(f => {
      const el = container.querySelector(`#df_${f.fieldKey}`);
      if (!el) return;
      if (f.fieldType === 'multiselect') {
        data[f.fieldKey] = Array.from(container.querySelectorAll(`input[name="${f.fieldKey}"]:checked`)).map(i => i.value);
      } else if (f.fieldType === 'boolean') {
        data[f.fieldKey] = el.checked;
      } else {
        data[f.fieldKey] = el.value;
      }
    });
    fields.forEach(f => {
      if (!f.dependsOn) return;
      const wrapper = container.querySelector(`[data-field="${f.fieldKey}"]`);
      if (!wrapper) return;
      const visible = evaluateCondition(f, data);
      wrapper.style.display = visible ? '' : 'none';
    });
  }
  container.addEventListener('change', refresh);
  container.addEventListener('input', refresh);
  refresh();
}
