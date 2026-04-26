const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: null },

    isClosed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatThread', chatThreadSchema);