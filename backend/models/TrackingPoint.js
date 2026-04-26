const mongoose = require('mongoose');

const trackingPointSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrackingSession',
      required: true,
      index: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    lat: { type: Number, required: true },
    lng: { type: Number, required: true },

    speed: { type: Number, default: null },
    heading: { type: Number, default: null },
    accuracy: { type: Number, default: null },

    recordedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrackingPoint', trackingPointSchema);