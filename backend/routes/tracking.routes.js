const express = require('express');
const router = express.Router();

const {
  startTracking,
  updateCurrentLocation,
  getTrackingSession,
  addTrackingPoint,
  stopTracking
} = require('../controllers/tracking.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/start/:orderId', protect, authorize('worker', 'admin'), startTracking);
router.patch('/location/:orderId', protect, authorize('worker', 'admin'), updateCurrentLocation);
router.post('/point/:orderId', protect, authorize('worker', 'admin'), addTrackingPoint);
router.get('/:orderId', protect, getTrackingSession);
router.post('/stop/:orderId', protect, authorize('worker', 'admin'), stopTracking);

module.exports = router;