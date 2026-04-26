const express = require('express');
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentCallback,
  getPaymentsByOrder,
  refundPayment
} = require('../controllers/payment.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/callback', handlePaymentCallback);
router.get('/order/:orderId', protect, getPaymentsByOrder);
router.post('/:id/refund', protect, authorize('admin'), refundPayment);

module.exports = router;