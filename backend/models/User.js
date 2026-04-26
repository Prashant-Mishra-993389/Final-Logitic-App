const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },

    role: {
      type: String,
      enum: ['customer', 'worker', 'admin'],
      default: 'customer',
      index: true
    },
    otp: { type: String, default: null },
otpExpiry: { type: Date, default: null },
isVerified: { type: Boolean, default: false },

    avatar: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);