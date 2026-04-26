const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAvailableOrders,
  getOrderById,
  updateOrderStatus,
  assignProvider,
  cancelOrder,
  addTimelineNote
} = require('../controllers/order.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/', protect, authorize('customer'), createOrder);
router.get('/my', protect, getMyOrders);
router.get('/available', protect, authorize('worker', 'admin'), getAvailableOrders);
router.get('/:id', protect, getOrderById);

router.patch('/:id/status', protect, authorize('worker', 'admin'), updateOrderStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignProvider);
router.patch('/:id/cancel', protect, cancelOrder);
router.post('/:id/timeline', protect, addTimelineNote);

module.exports = router;