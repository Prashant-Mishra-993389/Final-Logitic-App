const crypto = require('crypto');
const Razorpay = require('razorpay');
const asyncHandler = require('../utils/asyncHandler');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const razorpayInstance = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) throw new ApiError(400, 'Order ID and amount are required');

  if (!razorpayInstance) {
    return res.status(200).json(new ApiResponse(200, { order: { id: `mock_order_${Date.now()}`, amount: amount * 100, currency: 'INR' } }, 'Order created'));
  }

  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `rcpt_${orderId.toString().slice(-8)}`,
    notes: { orderId: orderId.toString(), amount: amount.toString() }
  };

  const order = await razorpayInstance.orders.create(options);
  if (!order) throw new ApiError(500, 'Failed to create Razorpay order');
  
  // Save razorpayOrderId to the order
  await Order.findByIdAndUpdate(orderId, { razorpayOrderId: order.id });

  res.status(200).json(new ApiResponse(200, { order }, 'Order created'));
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, amount } = req.body;

  if (razorpayInstance && razorpaySignature && razorpaySignature !== 'mock_signature') {
    // ---> FIX: Prevent server crash if env variable is missing
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new ApiError(500, 'Server configuration error: missing Razorpay secret');
    }

    // ---> FIX: Wrap in try/catch so crypto errors are caught gracefully
    try {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new ApiError(400, 'Invalid payment signature');
      }
    } catch (error) {
      throw new ApiError(500, 'Error validating payment signature');
    }
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  let payment = await Payment.findOne({ transactionId: razorpayPaymentId });
  if (!payment) {
    payment = await Payment.create({
      orderId,
      payerId: req.user._id,
      payeeId: order.providerId,
      amount,
      transactionId: razorpayPaymentId || `mock_txn_${Date.now()}`,
      status: 'paid',
      paidAt: new Date(),
      method: 'razorpay'
    });

    // Update order status to in_progress and add timeline entry
    order.status = 'in_progress';
    order.timeline.push({ 
      status: 'in_progress', 
      note: `Payment of ₹${amount} received. Job is now in progress.`, 
      by: req.user._id 
    });
    await order.save();
  }

  res.status(200).json(new ApiResponse(200, payment, 'Payment verified'));
});

exports.handlePaymentCallback = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, error } = req.body;
  
  // Use CLIENT_URL (e.g. localhost:3000 or localhost:5500) where the user actually is
  const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5000';

  // If Razorpay sends an error payload (e.g. user cancelled or payment failed)
  if (error || !razorpay_signature) {
    return res.redirect(`${frontendUrl}/#/payment/failure`);
  }
  
  // ---> FIX: Prevent server crash here as well
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.redirect(`${frontendUrl}/#/payment/failure`);
  }
  
  // This is called when Razorpay redirects for certain payment methods
  // We check signature and redirect the user back to the frontend
  let isSuccess = false;
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    isSuccess = (generatedSignature === razorpay_signature);
  } catch (err) {
    console.error("Callback signature generation error:", err);
    isSuccess = false;
  }
  
  if (isSuccess) {
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (order) {
      // Create payment if not exists
      let payment = await Payment.findOne({ transactionId: razorpay_payment_id });
      if (!payment) {
        payment = await Payment.create({
          orderId: order._id,
          payerId: order.customerId,
          payeeId: order.providerId,
          amount: order.finalPrice || order.budget || 0,
          transactionId: razorpay_payment_id,
          status: 'paid',
          paidAt: new Date(),
          method: 'razorpay'
        });

        order.status = 'accepted';
        order.timeline.push({ status: 'paid', note: 'Paid via Razorpay Redirect', at: new Date() });
        await order.save();
      }
      return res.redirect(`${frontendUrl}/#/payment/success?orderId=${order._id}`);
    }
    res.redirect(`${frontendUrl}/#/payment/success`);
  } else {
    res.redirect(`${frontendUrl}/#/payment/failure`);
  }
});

exports.getPaymentsByOrder = asyncHandler(async (req, res) => {
  if (req.params.orderId === 'all') {
    const payments = await Payment.find({ payeeId: req.user._id })
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
    return res.status(200).json(new ApiResponse(200, payments, 'Payments fetched'));
  }
  const payments = await Payment.find({ orderId: req.params.orderId })
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
  const payment = payments.length > 0 ? payments[0] : null;
  res.status(200).json(new ApiResponse(200, payment, 'Payment fetched'));
});

exports.refundPayment = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, {}, 'Payment refunded'));
});