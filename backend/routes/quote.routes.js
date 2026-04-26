const express = require('express');
const router = express.Router();

const {
  createQuote,
  getQuotesByOrder,
  getMyQuotes,
  updateQuoteStatus,
  deleteQuote
} = require('../controllers/quote.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/', protect, authorize('worker'), createQuote);
router.get('/my', protect, authorize('worker'), getMyQuotes);
router.get('/order/:orderId', protect, getQuotesByOrder);

router.patch('/:id/status', protect, authorize('customer', 'admin'), updateQuoteStatus);
router.delete('/:id', protect, authorize('worker', 'admin'), deleteQuote);

module.exports = router;