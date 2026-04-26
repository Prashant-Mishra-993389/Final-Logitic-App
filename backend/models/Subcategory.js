const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },

    isLogistics: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },

    priceMin: { type: Number, default: 0 },
    priceMax: { type: Number, default: 0 },

    slaHours: { type: Number, default: null }
  },
  { timestamps: true }
);

subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);