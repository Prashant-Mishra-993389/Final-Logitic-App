const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalPayments = await Payment.countDocuments();
  const totalRevenueAgg = await Payment.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  res.status(200).json(
    new ApiResponse(200, { totalUsers, totalOrders, totalPayments, totalRevenue }, 'Stats fetched')
  );
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, 'Users fetched'));
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('categoryId subcategoryId serviceId customerId providerId', 'name title email role')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, orders, 'Orders fetched'));
});

exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: 'orderId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'subcategoryId', select: 'name' },
        { path: 'serviceId', select: 'title' },
        { path: 'customerId', select: 'name' }
      ]
    })
    .populate('payerId payeeId', 'name email role')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, payments, 'Payments fetched'));
});

exports.blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isBlocked = true;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, 'User blocked'));
});

exports.verifyWorker = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ userId: req.params.id });
  if (!profile) throw new ApiError(404, 'Worker profile not found');

  profile.verificationStatus = 'pending';
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile, 'Worker verification set to pending'));
});

exports.approveWorker = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ userId: req.params.id });
  if (!profile) throw new ApiError(404, 'Worker profile not found');

  profile.verificationStatus = 'verified';
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile, 'Worker approved'));
});

exports.rejectWorker = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ userId: req.params.id });
  if (!profile) throw new ApiError(404, 'Worker profile not found');

  profile.verificationStatus = 'rejected';
  profile.verificationRejections += 1;
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile, 'Worker rejected'));
});

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
  res.status(200).json(new ApiResponse(200, logs, 'Audit logs fetched'));
});