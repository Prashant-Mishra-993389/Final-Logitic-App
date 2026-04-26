// js/utils/validation.js — Form validation helpers

export const Validator = {
  required(value) {
    if (value === null || value === undefined) return 'This field is required';
    if (typeof value === 'string' && !value.trim()) return 'This field is required';
    if (Array.isArray(value) && value.length === 0) return 'At least one option is required';
    return null;
  },

  email(value) {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase()) ? null : 'Enter a valid email address';
  },

  phone(value) {
    if (!value) return null;
    const cleaned = String(value).replace(/\D/g, '');
    return cleaned.length >= 10 ? null : 'Enter a valid phone number (10+ digits)';
  },

  minLength(min) {
    return (value) => {
      if (!value) return null;
      return String(value).length >= min ? null : `Minimum ${min} characters required`;
    };
  },

  maxLength(max) {
    return (value) => {
      if (!value) return null;
      return String(value).length <= max ? null : `Maximum ${max} characters allowed`;
    };
  },

  min(minVal) {
    return (value) => {
      if (value === '' || value === null || value === undefined) return null;
      return Number(value) >= minVal ? null : `Minimum value is ${minVal}`;
    };
  },

  max(maxVal) {
    return (value) => {
      if (value === '' || value === null || value === undefined) return null;
      return Number(value) <= maxVal ? null : `Maximum value is ${maxVal}`;
    };
  },

  password(value) {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },

  match(other, label = 'Passwords') {
    return (value) => {
      return value === other ? null : `${label} do not match`;
    };
  },

  // Run multiple validators, return first error
  run(value, ...validators) {
    for (const v of validators) {
      const err = v(value);
      if (err) return err;
    }
    return null;
  },

  // Validate a form object against a rules map
  // rules: { fieldName: [validator, ...] }
  validateForm(data, rules) {
    const errors = {};
    let valid = true;
    for (const [field, validators] of Object.entries(rules)) {
      const err = this.run(data[field], ...validators);
      if (err) { errors[field] = err; valid = false; }
    }
    return { valid, errors };
  },
};

// Show inline error on a field
export function showFieldError(inputEl, message) {
  clearFieldError(inputEl);
  if (!message) return;
  inputEl.style.borderColor = 'var(--danger, #ef4444)';
  const err = document.createElement('div');
  err.className = 'field-error';
  err.textContent = message;
  inputEl.parentNode.appendChild(err);
}

export function clearFieldError(inputEl) {
  inputEl.style.borderColor = '';
  const existing = inputEl.parentNode?.querySelector('.field-error');
  if (existing) existing.remove();
}

export function clearAllErrors(formEl) {
  formEl.querySelectorAll('.field-error').forEach(e => e.remove());
  formEl.querySelectorAll('input, select, textarea').forEach(el => el.style.borderColor = '');
}
