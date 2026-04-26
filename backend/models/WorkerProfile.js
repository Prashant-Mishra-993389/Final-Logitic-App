const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, enum: ['image', 'pdf'], default: 'image' },
    year: { type: Number, default: null }
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    skills: [{ type: String, trim: true }],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },

    availability: {
      type: String,
      enum: ['available', 'busy', 'on_leave'],
      default: 'available'
    },

    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      days: [{ type: String, default: 'Monday' }]
    },

    serviceAreas: [
      {
        city: { type: String, trim: true },
        pincode: { type: String, trim: true },
        radiusKm: { type: Number, default: 10 }
      }
    ],

    languages: [{ type: String, trim: true }],

    bio: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },

    certifications: [certificateSchema],

    idProofUrl: { type: String, default: '' },
    idProofResourceType: {
      type: String,
      enum: ['image', 'pdf'],
      default: 'image'
    },

    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },

    verificationRejections: { type: Number, default: 0 },

    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    responseTimeAvgMins: { type: Number, default: 0 }
  },
  { timestamps: true }
);

workerProfileSchema.virtual('averageRating').get(function () {
  if (!this.ratingCount) return 0;
  return Number((this.ratingSum / this.ratingCount).toFixed(1));
});

workerProfileSchema.set('toJSON', { virtuals: true });
workerProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);