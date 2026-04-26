// js/utils/formatter.js — Data formatting utilities

export const Formatter = {
  currency(amount, currency = 'INR') {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  number(n) {
    if (n === null || n === undefined) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  },

  percent(value, total) {
    if (!total) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  },

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  titleCase(str) {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\w\S*/g, t =>
      t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    );
  },

  statusLabel(status) {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },

  phone(phone) {
    if (!phone) return '-';
    const p = String(phone).replace(/\D/g, '');
    if (p.length === 10) return `+91 ${p.slice(0,5)} ${p.slice(5)}`;
    return phone;
  },

  truncate(str, len = 60) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
  },

  fileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  rating(value) {
    if (!value) return '0.0';
    return Number(value).toFixed(1);
  },

  initials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2);
  },
};
