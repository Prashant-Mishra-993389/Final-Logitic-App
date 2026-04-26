const mongoose = require('mongoose');

const routePointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const trackingSessionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },

    pickupLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' }
    },

    destinationLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' }
    },

    routePolyline: [routePointSchema],

    etaMinutes: { type: Number, default: null },

    status: {
      type: String,
      enum: ['not_started', 'active', 'nearby', 'arrived', 'picked_up', 'delivered', 'stopped'],
      default: 'not_started'
    },

    lastUpdatedAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrackingSession', trackingSessionSchema);