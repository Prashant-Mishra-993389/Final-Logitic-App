const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviewsByUser,
  getReviewsByOrder,
  deleteReview
} = require('../controllers/review.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/', protect, authorize('customer'), createReview);
router.get('/user/:userId', getReviewsByUser);
router.get('/order/:orderId', protect, getReviewsByOrder);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;