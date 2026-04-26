const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.getMyProfile = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ userId: req.user._id });

  if (!profile) throw new ApiError(404, 'Profile not found');

  res.status(200).json(new ApiResponse(200, profile));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ userId: req.user._id });

  if (!profile) throw new ApiError(404, 'Profile not found');

  Object.assign(profile, req.body);
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile, 'Updated'));
});