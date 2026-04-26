const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['company', 'factory', 'warehouse', 'office', 'other'],
      default: 'company'
    },

    gstNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },

    billingAddress: { type: String, default: '' },
    shippingAddresses: [{ type: String }],

    contactPersons: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, default: '' },
        designation: { type: String, default: '' }
      }
    ],

    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    industryType: { type: String, default: '' },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10'
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);