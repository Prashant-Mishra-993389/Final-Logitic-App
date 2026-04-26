// js/utils/constants.js — App-wide constants

export const ROLES = {
  CUSTOMER: 'customer',
  WORKER:   'worker',
  ADMIN:    'admin',
};

export const ORDER_STATUS = {
  PENDING:     'pending',
  CONFIRMED:   'confirmed',
  ASSIGNED:    'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
};

export const QUOTE_STATUS = {
  PENDING:  'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS = {
  PENDING:  'pending',
  PAID:     'paid',
  REFUNDED: 'refunded',
  FAILED:   'failed',
};

export const SUPPORT_STATUS = {
  OPEN:        'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED:    'resolved',
  CLOSED:      'closed',
};

export const WORKER_STATUS = {
  PENDING:  'pending',
  VERIFIED: 'verified',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED:  'blocked',
};

export const FIELD_TYPES = {
  TEXT:        'text',
  NUMBER:      'number',
  TEXTAREA:    'textarea',
  SELECT:      'select',
  MULTISELECT: 'multiselect',
  FILE:        'file',
  DATE:        'date',
  BOOLEAN:     'boolean',
};

export const NAV_CUSTOMER = [
  { label: 'Dashboard',      icon: '⊞', route: '#/customer/dashboard' },
  { label: 'Create Order',   icon: '＋', route: '#/customer/create-order' },
  { label: 'My Orders',      icon: '📋', route: '#/customer/orders' },
  { label: 'Quotes',         icon: '💬', route: '#/customer/quotes' },
  { label: 'Payments',       icon: '💳', route: '#/customer/payment' },
  { label: 'Tracking',       icon: '📍', route: '#/customer/tracking' },
  { label: 'Chat',           icon: '💭', route: '#/customer/chat' },
  { label: 'Notifications',  icon: '🔔', route: '#/customer/notifications' },
  { label: 'Reviews',        icon: '⭐', route: '#/customer/reviews' },
  { label: 'Support',        icon: '🎧', route: '#/customer/support' },
  { label: 'Profile',        icon: '👤', route: '#/customer/profile' },
];

export const NAV_WORKER = [
  { label: 'Dashboard',      icon: '⊞', route: '#/worker/dashboard' },
  { label: 'Assigned Jobs',  icon: '🔧', route: '#/worker/assigned-jobs' },
  { label: 'Available Jobs', icon: '📦', route: '#/worker/available-jobs' },
  { label: 'Quotes',         icon: '💬', route: '#/worker/create-quote' },
  { label: 'Tracking',       icon: '📍', route: '#/worker/tracking' },
  { label: 'Earnings',       icon: '💰', route: '#/worker/earnings' },
  { label: 'Ratings',        icon: '⭐', route: '#/worker/ratings' },
  { label: 'Documents',      icon: '📄', route: '#/worker/documents' },
  { label: 'Availability',   icon: '📅', route: '#/worker/availability' },
  { label: 'Chat',           icon: '💭', route: '#/worker/chat' },
  { label: 'Profile',        icon: '👤', route: '#/worker/profile' },
];

export const NAV_ADMIN = [
  { label: 'Dashboard',     icon: '⊞', route: '#/admin/dashboard' },
  { label: 'Analytics',     icon: '📊', route: '#/admin/analytics' },
  { label: 'Users',         icon: '👥', route: '#/admin/users' },
  { label: 'Workers',       icon: '🔧', route: '#/admin/workers' },
  { label: 'Orders',        icon: '📋', route: '#/admin/orders' },
  { label: 'Payments',      icon: '💳', route: '#/admin/payments' },
  { label: 'Categories',    icon: '📁', route: '#/admin/categories' },
  { label: 'Subcategories', icon: '📂', route: '#/admin/subcategories' },
  { label: 'Requirements',  icon: '📝', route: '#/admin/requirements' },
  { label: 'Services',      icon: '⚙️',  route: '#/admin/services' },
  { label: 'AMC Plans',     icon: '🔄', route: '#/admin/amc' },
  { label: 'Support',       icon: '🎧', route: '#/admin/support' },
  { label: 'Audit Logs',    icon: '📜', route: '#/admin/audit-logs' },
];
