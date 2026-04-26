const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const slugify = require('slugify');

exports.createSubcategory = asyncHandler(async (req, res) => {
  const { categoryId, name, description, isLogistics, priceMin, priceMax, slaHours, sortOrder } = req.body;

  if (!categoryId || !name) throw new ApiError(400, 'Category and subcategory name are required');

  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, 'Category not found');

  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Subcategory.findOne({ categoryId, slug });
  if (exists) throw new ApiError(400, 'Subcategory already exists in this category');

  const subcategory = await Subcategory.create({
    categoryId,
    name,
    slug,
    description,
    isLogistics: isLogistics || false,
    priceMin: priceMin || 0,
    priceMax: priceMax || 0,
    slaHours: slaHours || null,
    sortOrder: sortOrder || 0,
  });

  res.status(201).json(new ApiResponse(201, subcategory, 'Subcategory created'));
});

exports.getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await Subcategory.find({ isActive: true })
    .populate('categoryId', 'name slug icon')
    .sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, subcategories, 'Subcategories fetched'));
});

exports.getSubcategoryById = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id).populate('categoryId', 'name slug icon');
  if (!subcategory) throw new ApiError(404, 'Subcategory not found');

  res.status(200).json(new ApiResponse(200, subcategory, 'Subcategory fetched'));
});

exports.getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const subcategories = await Subcategory.find({ categoryId, isActive: true }).sort({ sortOrder: 1 });
  res.status(200).json(new ApiResponse(200, subcategories, 'Subcategories fetched'));
});

exports.updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);
  if (!subcategory) throw new ApiError(404, 'Subcategory not found');

  const { categoryId, name, description, isLogistics, isActive, priceMin, priceMax, slaHours, sortOrder } = req.body;

  if (categoryId) subcategory.categoryId = categoryId;
  if (name) {
    subcategory.name = name;
    subcategory.slug = slugify(name, { lower: true, strict: true });
  }
  if (description !== undefined) subcategory.description = description;
  if (isLogistics !== undefined) subcategory.isLogistics = isLogistics;
  if (isActive !== undefined) subcategory.isActive = isActive;
  if (priceMin !== undefined) subcategory.priceMin = priceMin;
  if (priceMax !== undefined) subcategory.priceMax = priceMax;
  if (slaHours !== undefined) subcategory.slaHours = slaHours;
  if (sortOrder !== undefined) subcategory.sortOrder = sortOrder;

  await subcategory.save();

  res.status(200).json(new ApiResponse(200, subcategory, 'Subcategory updated'));
});

exports.deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
  if (!subcategory) throw new ApiError(404, 'Subcategory not found');

  res.status(200).json(new ApiResponse(200, null, 'Subcategory deleted'));
});