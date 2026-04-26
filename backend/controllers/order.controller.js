const Order = require('../models/Order');
const Organization = require('../models/Organization');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const ServiceTemplate = require('../models/ServiceTemplate');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createOrder = asyncHandler(async (req, res) => {
  const {
    organizationId,
    categoryId,
    subcategoryId,
    serviceId,
    answers,
    attachments,
    description,
    priority,
    scheduledAt,
    location,
    isLogistics,
    quotedPrice,
  } = req.body;

  if (!categoryId || !subcategoryId || !location) {
    throw new ApiError(400, 'categoryId, subcategoryId and location are required');
  }

  const order = await Order.create({
    customerId: req.user._id,
    organizationId: organizationId || null,
    categoryId,
    subcategoryId,
    serviceId: serviceId || null,
    answers: answers || [],
    attachments: attachments || [],
    description: description || '',
    priority: priority || 'normal',
    scheduledAt: scheduledAt || null,
    location,
    isLogistics: isLogistics || false,
    quotedPrice: quotedPrice || 0,
    timeline: [
      {
        status: 'requested',
        note: 'Order created',
        by: req.user._id,
      },
    ],
  });

  res.status(201).json(new ApiResponse(201, order, 'Order created'));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [{ customerId: req.user._id }, { providerId: req.user._id }],
  })
    .populate('categoryId subcategoryId serviceId providerId customerId', 'name title email phone role')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, orders, 'My orders fetched'));
});

exports.getAvailableOrders = asyncHandler(async (req, res) => {
  const WorkerProfile = require('../models/WorkerProfile');
  let wp = await WorkerProfile.findOne({ userId: req.user._id });
  
  if (!wp) {
    // Auto-create profile for legacy workers who registered before profile creation was added
    wp = await WorkerProfile.create({ userId: req.user._id, availability: 'available' });
  }
  
  if (wp.availability === 'busy') {
    return res.status(200).json(new ApiResponse(200, [], 'You are currently busy on an active job.'));
  }

  // Match orders that have no provider assigned (null or field missing)
  const orders = await Order.find({
    status: { $in: ['requested', 'quote_pending'] },
    $or: [{ providerId: null }, { providerId: { $exists: false } }]
  })
    .populate('categoryId', 'name')
    .populate('subcategoryId', 'name')
    .populate('serviceId', 'title basePrice minPrice maxPrice pricingType')
    .populate('customerId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, orders, 'Available orders fetched'));
});


exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customerId providerId categoryId subcategoryId serviceId')
    .populate('organizationId');

  if (!order) throw new ApiError(404, 'Order not found');

  res.status(200).json(new ApiResponse(200, order, 'Order fetched'));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.status = status;

  order.timeline.push({
    status,
    note: note || '',
    by: req.user._id,
  });

  await order.save();

  if (status === 'completed' && order.providerId) {
    const WorkerProfile = require('../models/WorkerProfile');
    await WorkerProfile.findOneAndUpdate({ userId: order.providerId }, { availability: 'available' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(order._id.toString()).emit('orderStatusUpdated', {
      orderId: order._id,
      status: order.status,
    });
  }

  res.status(200).json(new ApiResponse(200, order, 'Order status updated'));
});

exports.assignProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.providerId = providerId;
  order.status = 'assigned';

  order.timeline.push({
    status: 'assigned',
    note: 'Provider assigned',
    by: req.user._id,
  });

  await order.save();

  const WorkerProfile = require('../models/WorkerProfile');
  await WorkerProfile.findOneAndUpdate({ userId: providerId }, { availability: 'busy' });

  res.status(200).json(new ApiResponse(200, order, 'Provider assigned'));
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.status = 'cancelled';
  order.timeline.push({
    status: 'cancelled',
    note: note || 'Order cancelled',
    by: req.user._id,
  });

  await order.save();

  res.status(200).json(new ApiResponse(200, order, 'Order cancelled'));
});

exports.addTimelineNote = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.timeline.push({
    status: status || order.status,
    note: note || '',
    by: req.user._id,
  });

  await order.save();

  res.status(200).json(new ApiResponse(200, order, 'Timeline updated'));
});