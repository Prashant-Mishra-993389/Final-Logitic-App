const express = require('express');
const router = express.Router();

const {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification
} = require('../controllers/notification.controller');

const { protect } = require('../middlewares/auth.middleware');

router.get('/my', protect, getMyNotifications);
router.patch('/:id/read', protect, markNotificationRead);
router.patch('/read-all', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;