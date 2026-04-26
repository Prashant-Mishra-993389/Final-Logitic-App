const mongoose = require('mongoose');

const amcPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],

    subcategoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
      }
    ],

    durationMonths: { type: Number, required: true },
    price: { type: Number, required: true },

    visitLimit: { type: Number, default: null },
    benefits: [{ type: String }],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AMCPlan', amcPlanSchema);