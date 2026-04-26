const express = require('express');
const router = express.Router();

const {
  createThread,
  getThreadByOrder,
  sendMessage,
  getMessages,
  closeThread
} = require('../controllers/chat.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/thread', protect, createThread);
router.get('/thread/:orderId', protect, getThreadByOrder);
router.post('/message', protect, sendMessage);
router.get('/messages/:threadId', protect, getMessages);
router.patch('/thread/:threadId/close', protect, authorize('admin'), closeThread);

module.exports = router;