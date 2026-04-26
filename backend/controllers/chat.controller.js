const ChatThread = require('../models/ChatThread');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createThread = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const Order = require('../models/Order');
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  const participants = [order.customerId, order.providerId].filter(Boolean);

  const thread = await ChatThread.findOneAndUpdate(
    { orderId },
    { 
      $setOnInsert: { orderId },
      $set: { participants }
    },
    { upsert: true, new: true }
  ).populate('participants', 'name role');

  res.status(201).json(new ApiResponse(201, thread, 'Thread created'));
});

exports.getThreadByOrder = asyncHandler(async (req, res) => {
  const thread = await ChatThread.findOne({ orderId: req.params.orderId });
  if (!thread) throw new ApiError(404, 'Thread not found');

  res.status(200).json(new ApiResponse(200, thread, 'Thread fetched'));
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { threadId, text, attachments } = req.body;

  const message = await Message.create({
    threadId,
    senderId: req.user._id,
    text: text || '',
    attachments: attachments || [],
  });

  const thread = await ChatThread.findByIdAndUpdate(threadId, {
    lastMessage: text || 'Attachment',
    lastMessageAt: new Date(),
  }, { new: true });

  const io = req.app.get('io');
  if (io && thread && thread.orderId) {
    io.to(thread.orderId.toString()).emit('newMessage', message);
  }

  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ threadId: req.params.threadId }).sort({ createdAt: 1 });
  res.status(200).json(new ApiResponse(200, messages, 'Messages fetched'));
});

exports.closeThread = asyncHandler(async (req, res) => {
  const thread = await ChatThread.findById(req.params.threadId);
  if (!thread) throw new ApiError(404, 'Thread not found');

  thread.isClosed = true;
  await thread.save();

  res.status(200).json(new ApiResponse(200, thread, 'Thread closed'));
});