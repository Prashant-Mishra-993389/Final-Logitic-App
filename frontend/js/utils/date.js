// js/utils/date.js — Date/time utilities

export const DateUtil = {
  format(date, options = {}) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    const defaults = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-IN', { ...defaults, ...options });
  },

  formatDateTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  },

  formatTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  relative(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    const diff = Date.now() - d.getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60)  return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60)  return `${mins}m ago`;
    const hrs  = Math.floor(mins / 60);
    if (hrs  < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)   return `${days}d ago`;
    if (days < 30)  return `${Math.floor(days/7)}w ago`;
    return this.format(date);
  },

  toInput(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0,10);
  },

  isFuture(date) {
    return new Date(date) > new Date();
  },

  isPast(date) {
    return new Date(date) < new Date();
  },

  daysDiff(from, to = new Date()) {
    const diff = new Date(to) - new Date(from);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
};
