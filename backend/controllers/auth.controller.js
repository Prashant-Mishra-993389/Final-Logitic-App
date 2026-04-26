const jwt = require('jsonwebtoken');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};


exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    throw new ApiError(400, 'Please fill all required fields');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already exists');
  }

  // 🔥 Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 🔐 Hash OTP (security)
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'customer',
    otp: hashedOtp,
    otpExpiry: Date.now() + 10 * 60 * 1000,
    isVerified: false,
  });

  if (user.role === 'worker') {
    await WorkerProfile.create({ userId: user._id });
  }

  // 📧 Send OTP
  try {
    await sendEmail({
      to: email,
      subject: 'Your OTP Code',
      otp: otp
    });
  } catch (err) {
    console.log("Email failed:", err.message);
  }

  res.status(201).json(
    new ApiResponse(201, { userId: user._id }, 'OTP sent to email')
  );
});

const crypto = require('crypto');

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  if (user.otp !== hashedOtp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (user.otpExpiry < Date.now()) {
    throw new ApiError(400, 'OTP expired');
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  const token = generateToken(user._id);

  res.status(200).json(
    new ApiResponse(200, { token }, 'Account verified successfully')
  );
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your account first');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account is blocked');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  const safeUser = await User.findById(user._id).select('-password');

  res.status(200).json(
    new ApiResponse(200, { user: safeUser, token }, 'Login successful')
  );
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Profile fetched'));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { name, phone, avatar, workerProfile } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  if (user.role === 'worker' && workerProfile) {
    const wp = await WorkerProfile.findOne({ userId: user._id });
    if (wp) {
      if (workerProfile.isAvailable !== undefined) {
        // If trying to set to available/on_leave, check for active orders
        if (workerProfile.isAvailable) {
           const activeOrder = await require('../models/Order').findOne({
             providerId: user._id,
             status: { $in: ['assigned', 'in_progress', 'reached', 'picked_up', 'on_the_way'] }
           });
           
           if (activeOrder) {
             throw new ApiError(400, 'You cannot set yourself as available while you have an active job assigned. Please complete your current job first.');
           }
           
           wp.availability = 'available';
        } else {
           wp.availability = 'on_leave';
        }
      }
      if (workerProfile.serviceAreas) wp.serviceAreas = workerProfile.serviceAreas;
      if (workerProfile.skills) wp.skills = workerProfile.skills;
      if (workerProfile.languages) wp.languages = workerProfile.languages;
      if (workerProfile.bio !== undefined) wp.bio = workerProfile.bio;
      
      // Also update verification status implicitly if submitting docs via docs update
      if (workerProfile.documents) {
        wp.documents = { ...wp.documents, ...workerProfile.documents };
        wp.verificationStatus = 'pending';
      }
      
      await wp.save();
    }
  }

  const safeUser = await User.findById(user._id).select('-password');
  // Need to manually append workerProfile if it's a worker for the response
  let responseUser = safeUser.toObject();
  if (user.role === 'worker') {
    const wp = await WorkerProfile.findOne({ userId: user._id });
    responseUser.workerProfile = wp;
  }

  res.status(200).json(new ApiResponse(200, responseUser, 'Profile updated'));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old and new password are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    throw new ApiError(400, 'Old password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});