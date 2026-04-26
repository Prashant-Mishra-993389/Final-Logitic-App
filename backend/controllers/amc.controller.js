const AMCPlan = require('../models/AMCPlan');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createAMCPlan = asyncHandler(async (req, res) => {
  const plan = await AMCPlan.create(req.body);
  res.status(201).json(new ApiResponse(201, plan, 'AMC plan created'));
});

exports.getAMCPlans = asyncHandler(async (req, res) => {
  const plans = await AMCPlan.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, plans, 'AMC plans fetched'));
});

exports.getAMCPlanById = asyncHandler(async (req, res) => {
  const plan = await AMCPlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'AMC plan not found');

  res.status(200).json(new ApiResponse(200, plan, 'AMC plan fetched'));
});

exports.updateAMCPlan = asyncHandler(async (req, res) => {
  const plan = await AMCPlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'AMC plan not found');

  Object.assign(plan, req.body);
  await plan.save();

  res.status(200).json(new ApiResponse(200, plan, 'AMC plan updated'));
});

exports.deleteAMCPlan = asyncHandler(async (req, res) => {
  const plan = await AMCPlan.findByIdAndDelete(req.params.id);
  if (!plan) throw new ApiError(404, 'AMC plan not found');

  res.status(200).json(new ApiResponse(200, null, 'AMC plan deleted'));
});