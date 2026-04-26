const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    amount: { type: Number, required: true },
    commissionAmount: { type: Number, default: 0 },
    providerPayout: { type: Number, default: 0 },

    currency: { type: String, default: 'INR' },

    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'netbanking', 'wallet', 'razorpay'],
      default: 'upi'
    },

    gateway: { type: String, default: '' },
    transactionId: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },

    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);