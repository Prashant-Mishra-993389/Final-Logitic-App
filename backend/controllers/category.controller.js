const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const slugify = require('slugify');

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, isLogistics, sortOrder } = req.body;

  if (!name) throw new ApiError(400, 'Category name is required');

  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Category.findOne({ slug });
  if (exists) throw new ApiError(400, 'Category already exists');

  const category = await Category.create({
    name,
    slug,
    icon,
    description,
    isLogistics: isLogistics || false,
    sortOrder: sortOrder || 0,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, categories, 'Categories fetched'));
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  res.status(200).json(new ApiResponse(200, category, 'Category fetched'));
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  const { name, icon, description, isLogistics, isActive, sortOrder } = req.body;

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });
  }
  if (icon !== undefined) category.icon = icon;
  if (description !== undefined) category.description = description;
  if (isLogistics !== undefined) category.isLogistics = isLogistics;
  if (isActive !== undefined) category.isActive = isActive;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;

  await category.save();

  res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});