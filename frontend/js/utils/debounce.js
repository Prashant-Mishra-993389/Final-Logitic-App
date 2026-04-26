// js/utils/debounce.js — Debounce and throttle utilities

export function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, limit = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      return fn.apply(this, args);
    }
  };
}

export function once(fn) {
  let called = false, result;
  return function(...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}
