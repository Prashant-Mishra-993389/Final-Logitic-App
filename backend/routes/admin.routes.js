const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  getAllPayments,
  blockUser,
  verifyWorker,
  approveWorker,
  rejectWorker,
  getAuditLogs
} = require('../controllers/admin.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/orders', protect, authorize('admin'), getAllOrders);
router.get('/payments', protect, authorize('admin'), getAllPayments);
router.patch('/users/:id/block', protect, authorize('admin'), blockUser);

router.patch('/workers/:id/verify', protect, authorize('admin'), verifyWorker);
router.patch('/workers/:id/approve', protect, authorize('admin'), approveWorker);
router.patch('/workers/:id/reject', protect, authorize('admin'), rejectWorker);

router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

module.exports = router;