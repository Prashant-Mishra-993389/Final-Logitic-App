const Organization = require('../models/Organization');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.createOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, org, 'Organization created'));
});

exports.getMyOrganizations = asyncHandler(async (req, res) => {
  const orgs = await Organization.find({ createdBy: req.user._id });

  res.status(200).json(new ApiResponse(200, orgs));
});