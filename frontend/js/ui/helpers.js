// js/ui/helpers.js — DOM utility functions

// Create element with props and children
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class' || key === 'className') {
      element.className = val;
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else if (key.startsWith('on') && typeof val === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'html') {
      element.innerHTML = val;
    } else if (key === 'text') {
      element.textContent = val;
    } else {
      element.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else if (Array.isArray(child)) {
      child.forEach(c => c && element.appendChild(
        c instanceof Node ? c : document.createTextNode(String(c))
      ));
    }
  }
  return element;
}

// Query helpers
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Set innerHTML safely and return element
export function render(container, html) {
  if (typeof container === 'string') container = $(container);
  if (!container) return;
  container.innerHTML = html;
  return container;
}

// Clear a container
export function clear(container) {
  if (typeof container === 'string') container = $(container);
  if (container) container.innerHTML = '';
}

// Mount a node into container (replaces content)
export function mount(container, node) {
  if (typeof container === 'string') container = $(container);
  if (!container) return;
  container.innerHTML = '';
  if (node) container.appendChild(node);
}

// Append a node
export function append(container, node) {
  if (typeof container === 'string') container = $(container);
  if (!container || !node) return;
  container.appendChild(node);
}

// Create element from HTML string
export function html2el(html) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstElementChild;
}

// Toggle class
export function toggleClass(el, cls, force) {
  if (typeof el === 'string') el = $(el);
  if (!el) return;
  el.classList.toggle(cls, force);
}

// Show/Hide
export function show(el, display = 'block') {
  if (typeof el === 'string') el = $(el);
  if (el) el.style.display = display;
}

export function hide(el) {
  if (typeof el === 'string') el = $(el);
  if (el) el.style.display = 'none';
}

// Scroll to top smoothly
export function scrollTop(container) {
  const el = typeof container === 'string' ? $(container) : container || window;
  if (el === window) window.scrollTo({ top: 0, behavior: 'smooth' });
  else el.scrollTo({ top: 0, behavior: 'smooth' });
}

// Animate on scroll (simple IntersectionObserver)
export function animateOnScroll(selector, cls = 'fade-in') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add(cls); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// Add ripple effect
export function addRipple(btn) {
  btn.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;border-radius:50%;transform:scale(0);
      animation:ripple 0.5s linear;
      background:rgba(255,255,255,0.15);
      width:${Math.max(rect.width,rect.height)}px;
      height:${Math.max(rect.width,rect.height)}px;
      left:${e.clientX - rect.left - Math.max(rect.width,rect.height)/2}px;
      top:${e.clientY - rect.top - Math.max(rect.width,rect.height)/2}px;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}
