const mongoose = require('mongoose');

const serviceTemplateSchema = new mongoose.Schema(
  {
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
      index: true
    },

    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    description: { type: String, default: '' },

    pricingType: {
      type: String,
      enum: ['fixed', 'range', 'quote_based'],
      default: 'quote_based'
    },

    basePrice: { type: Number, default: 0 },
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 },

    includes: [{ type: String }],
    excludes: [{ type: String }],

    estimatedDurationMins: { type: Number, default: null },

    requiredFieldsSnapshot: [
      {
        fieldKey: String,
        label: String,
        fieldType: String,
        required: Boolean,
        options: [String],
        unit: String
      }
    ],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceTemplate', serviceTemplateSchema);