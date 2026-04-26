const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/categories', require('./category.routes'));
router.use('/subcategories', require('./subcategory.routes'));
router.use('/requirements', require('./requirement.routes'));
router.use('/services', require('./service.routes'));
router.use('/orders', require('./order.routes'));
router.use('/quotes', require('./quote.routes'));
router.use('/tracking', require('./tracking.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/support', require('./support.routes'));
router.use('/amc', require('./amc.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/config', require('./config.routes'));

module.exports = router;