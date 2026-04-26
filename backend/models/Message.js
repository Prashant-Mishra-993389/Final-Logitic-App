const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatThread',
      required: true,
      index: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    text: { type: String, default: '' },

    attachments: [
      {
        url: { type: String, required: true },
        resourceType: { type: String, enum: ['image', 'pdf', 'video'], default: 'image' }
      }
    ],

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);