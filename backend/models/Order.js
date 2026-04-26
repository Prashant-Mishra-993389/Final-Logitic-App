const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    fieldKey: { type: String, required: true },
    label: { type: String, default: '' },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'pdf', 'video'], default: 'image' }
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const geoSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },

    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceTemplate',
      default: null
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    answers: [answerSchema],
    attachments: [attachmentSchema],

    description: { type: String, default: '' },

    status: {
      type: String,
      enum: [
        'requested',
        'quote_pending',
        'quoted',
        'assigned',
        'accepted',
        'in_progress',
        'reached',
        'picked_up',
        'on_the_way',
        'completed',
        'cancelled',
        'rejected'
      ],
      default: 'requested',
      index: true
    },

    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },

    scheduledAt: { type: Date, default: null },

    location: { type: geoSchema },

    isLogistics: { type: Boolean, default: false },

    quotedPrice: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    razorpayOrderId: { type: String, default: '' },

    notes: { type: String, default: '' },

    timeline: [timelineSchema]
  },
  { timestamps: true }
);

orderSchema.pre('validate', function () {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);