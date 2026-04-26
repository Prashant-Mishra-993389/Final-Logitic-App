const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else if (p.endsWith('.js')) callback(p);
  });
}

const replacements = [
  { from: /\bo\.category\b/g, to: 'o.categoryId' },
  { from: /\bo\.subcategory\b/g, to: 'o.subcategoryId' },
  { from: /\bo\.service\b/g, to: 'o.serviceId' },
  { from: /\bo\.customer\b/g, to: 'o.customerId' },
  { from: /\bo\.worker\b/g, to: 'o.providerId' },

  { from: /\bj\.category\b/g, to: 'j.categoryId' },
  { from: /\bj\.subcategory\b/g, to: 'j.subcategoryId' },

  { from: /\border\.category\b/g, to: 'order.categoryId' },
  { from: /\border\.subcategory\b/g, to: 'order.subcategoryId' },
  { from: /\border\.service\b/g, to: 'order.serviceId' },
  { from: /\border\.customer\b/g, to: 'order.customerId' },
  { from: /\border\.worker\b/g, to: 'order.providerId' },

  { from: /\bq\.order\b/g, to: 'q.orderId' },
  { from: /\br\.order\b/g, to: 'r.orderId' },

  { from: /key:\s*'category'/g, to: "key:'categoryId'" },
  { from: /key:\s*'subcategory'/g, to: "key:'subcategoryId'" },
  { from: /key:\s*'service'/g, to: "key:'serviceId'" },
  { from: /key:\s*'customer'/g, to: "key:'customerId'" },
  { from: /key:\s*'worker'/g, to: "key:'providerId'" },
  { from: /key:\s*'order'/g, to: "key:'orderId'" },

  // Special cases for order details
  { from: /\bt\?\.userId\b/g, to: 't?.by' }, // Timeline in order details uses 'by' for user
];

walk('/Users/riteshsharma/Coding/project/devesh project/frontend/js/pages', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
