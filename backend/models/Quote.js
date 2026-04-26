const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    laborCost: { type: Number, default: 0 },
    materialCost: { type: Number, default: 0 },
    travelCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true },

    estimatedTimeText: { type: String, default: '' },
    notes: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      index: true
    },

    validityUntil: { type: Date, default: null }
  },
  { timestamps: true }
);

quoteSchema.index({ orderId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('Quote', quoteSchema);