const RequirementFieldTemplate = require('../models/RequirementFieldTemplate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createRequirementField = asyncHandler(async (req, res) => {
  const {
    subcategoryId,
    label,
    fieldKey,
    fieldType,
    required,
    placeholder,
    helpText,
    options,
    min,
    max,
    unit,
    order,
    dependsOn,
  } = req.body;

  if (!subcategoryId || !label || !fieldKey || !fieldType) {
    throw new ApiError(400, 'subcategoryId, label, fieldKey, fieldType are required');
  }

  const field = await RequirementFieldTemplate.create({
    subcategoryId,
    label,
    fieldKey,
    fieldType,
    required: required || false,
    placeholder: placeholder || '',
    helpText: helpText || '',
    options: options || [],
    min,
    max,
    unit: unit || '',
    order: order || 0,
    dependsOn: dependsOn || undefined,
  });

  res.status(201).json(new ApiResponse(201, field, 'Requirement field created'));
});

exports.getRequirementFieldsBySubcategory = asyncHandler(async (req, res) => {
  const fields = await RequirementFieldTemplate.find({
    subcategoryId: req.params.subcategoryId,
    isActive: true,
  }).sort({ order: 1 });

  res.status(200).json(new ApiResponse(200, fields, 'Requirement fields fetched'));
});

exports.updateRequirementField = asyncHandler(async (req, res) => {
  const field = await RequirementFieldTemplate.findById(req.params.id);
  if (!field) throw new ApiError(404, 'Requirement field not found');

  Object.assign(field, req.body);
  await field.save();

  res.status(200).json(new ApiResponse(200, field, 'Requirement field updated'));
});

exports.deleteRequirementField = asyncHandler(async (req, res) => {
  const field = await RequirementFieldTemplate.findByIdAndDelete(req.params.id);
  if (!field) throw new ApiError(404, 'Requirement field not found');

  res.status(200).json(new ApiResponse(200, null, 'Requirement field deleted'));
});