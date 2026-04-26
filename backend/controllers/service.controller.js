const ServiceTemplate = require('../models/ServiceTemplate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const slugify = require('slugify');

exports.createService = asyncHandler(async (req, res) => {
  const {
    subcategoryId,
    title,
    description,
    pricingType,
    basePrice,
    minPrice,
    maxPrice,
    includes,
    excludes,
    estimatedDurationMins,
    requiredFieldsSnapshot,
  } = req.body;

  if (!subcategoryId || !title) throw new ApiError(400, 'subcategoryId and title are required');

  const slug = slugify(title, { lower: true, strict: true });

  const service = await ServiceTemplate.create({
    subcategoryId,
    title,
    slug,
    description,
    pricingType: pricingType || 'quote_based',
    basePrice: basePrice || 0,
    minPrice: minPrice || 0,
    maxPrice: maxPrice || 0,
    includes: includes || [],
    excludes: excludes || [],
    estimatedDurationMins: estimatedDurationMins || null,
    requiredFieldsSnapshot: requiredFieldsSnapshot || [],
  });

  res.status(201).json(new ApiResponse(201, service, 'Service created'));
});

exports.getServices = asyncHandler(async (req, res) => {
  const services = await ServiceTemplate.find({ isActive: true }).populate('subcategoryId', 'name slug');
  res.status(200).json(new ApiResponse(200, services, 'Services fetched'));
});

exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await ServiceTemplate.findById(req.params.id).populate('subcategoryId', 'name slug');
  if (!service) throw new ApiError(404, 'Service not found');

  res.status(200).json(new ApiResponse(200, service, 'Service fetched'));
});

exports.getServicesBySubcategory = asyncHandler(async (req, res) => {
  const services = await ServiceTemplate.find({
    subcategoryId: req.params.subcategoryId,
    isActive: true,
  });

  res.status(200).json(new ApiResponse(200, services, 'Services fetched'));
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await ServiceTemplate.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');

  if (req.body.title) {
    service.title = req.body.title;
    service.slug = slugify(req.body.title, { lower: true, strict: true });
  }

  Object.keys(req.body).forEach((key) => {
    if (key !== 'title') service[key] = req.body[key];
  });

  await service.save();

  res.status(200).json(new ApiResponse(200, service, 'Service updated'));
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await ServiceTemplate.findByIdAndDelete(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');

  res.status(200).json(new ApiResponse(200, null, 'Service deleted'));
});