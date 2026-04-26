const mongoose = require('mongoose');

const requirementFieldTemplateSchema = new mongoose.Schema(
  {
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
      index: true
    },

    label: { type: String, required: true, trim: true },
    fieldKey: { type: String, required: true, trim: true },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'textarea', 'select', 'multiselect', 'file', 'date', 'boolean'],
      required: true
    },

    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    helpText: { type: String, default: '' },

    options: [{ type: String }], // for select/multiselect
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    unit: { type: String, default: '' },

    order: { type: Number, default: 0 },

    dependsOn: {
      fieldKey: { type: String, default: '' },
      value: { type: mongoose.Schema.Types.Mixed, default: null }
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

requirementFieldTemplateSchema.index({ subcategoryId: 1, fieldKey: 1 }, { unique: true });

module.exports = mongoose.model('RequirementFieldTemplate', requirementFieldTemplateSchema);