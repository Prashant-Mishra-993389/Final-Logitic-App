const asyncHandler = require('../utils/asyncHandler');
const Quote = require('../models/Quote');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const Order = require('../models/Order');

exports.createQuote = asyncHandler(async (req, res) => {
  const { orderId, amount, estimatedDays, message } = req.body;

  if (!orderId || !amount) {
    throw new ApiError(400, 'Order ID and amount are required');
  }

  const order = await Order.findById(orderId).populate('serviceId');
  if (!order) throw new ApiError(404, 'Order not found');
  
  if (order.serviceId && order.serviceId.basePrice > 0 && amount < order.serviceId.basePrice) {
    throw new ApiError(400, `Bid amount cannot be less than the base price of ₹${order.serviceId.basePrice}`);
  }

  if (order.status !== 'requested' && order.status !== 'quote_pending') {
    throw new ApiError(400, 'Order is no longer accepting quotes');
  }

  // Update order status to quote_pending if it was requested
  if (order.status === 'requested') {
    order.status = 'quote_pending';
    await order.save();
  }

  const quote = await Quote.create({
    orderId,
    providerId: req.user._id,
    totalAmount: amount,
    estimatedTimeText: estimatedDays ? `${estimatedDays} days` : '',
    notes: message || '',
  });

  res.status(201).json(new ApiResponse(201, quote, 'Quote submitted successfully'));
});

exports.getMyQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ providerId: req.user._id })
    .populate({
      path: 'orderId',
      populate: [
        { path: 'categoryId', select: 'name' },
        { path: 'subcategoryId', select: 'name' },
        { path: 'serviceId', select: 'title' },
        { path: 'customerId', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, quotes, 'My quotes fetched'));
});

exports.getQuotesByOrder = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ orderId: req.params.orderId })
    .populate('providerId', 'name email phone avatar')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, quotes, 'Order quotes fetched'));
});

exports.updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const quote = await Quote.findById(req.params.id);
  
  if (!quote) throw new ApiError(404, 'Quote not found');

  if (status === 'accepted') {
    const order = await Order.findById(quote.orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    
    // Assign provider and update order status
    order.providerId = quote.providerId;
    order.status = 'assigned';
    order.finalPrice = quote.totalAmount;
    order.timeline.push({ status: 'assigned', note: 'Quote accepted', by: req.user._id });
    await order.save();
    
    // Reject all other pending quotes for this order
    await Quote.updateMany(
      { orderId: quote.orderId, _id: { $ne: quote._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );
    
    const WorkerProfile = require('../models/WorkerProfile');
    await WorkerProfile.findOneAndUpdate({ userId: quote.providerId }, { availability: 'busy' });
  }

  quote.status = status;
  await quote.save();

  res.status(200).json(new ApiResponse(200, quote, `Quote ${status}`));
});

exports.deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) throw new ApiError(404, 'Quote not found');
  
  if (quote.providerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  await quote.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, 'Quote deleted'));
});
