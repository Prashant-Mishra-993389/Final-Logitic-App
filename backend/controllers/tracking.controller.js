const TrackingSession = require('../models/TrackingSession');
const TrackingPoint = require('../models/TrackingPoint');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.startTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { pickupLocation, destinationLocation } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // Use order.location as destination if not explicitly provided
  const dest = destinationLocation?.lat ? destinationLocation : order.location || {};

  // Upsert — avoid duplicate key errors on re-starts
  let session = await TrackingSession.findOne({ orderId });
  if (session) {
    session.status = 'active';
    session.startedAt = new Date();
    session.endedAt = null;
    session.lastUpdatedAt = new Date();
    if (dest?.lat) session.destinationLocation = dest;
    await session.save();
  } else {
    session = await TrackingSession.create({
      orderId,
      driverId: req.user._id,
      pickupLocation: pickupLocation || {},
      destinationLocation: dest,
      status: 'active',
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
    });
  }

  if (order.status === 'assigned') {
    order.status = 'in_progress';
    order.timeline.push({ status: 'in_progress', note: 'Worker started tracking', by: req.user._id });
    await order.save();
  }

  res.status(201).json(new ApiResponse(201, session, 'Tracking started'));
});

exports.updateCurrentLocation = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { lat, lng, etaMinutes, status } = req.body;

  const session = await TrackingSession.findOne({ orderId });
  if (!session) throw new ApiError(404, 'Tracking session not found');

  session.currentLocation = { lat, lng };
  if (etaMinutes !== undefined) session.etaMinutes = etaMinutes;
  if (status) session.status = status;
  session.lastUpdatedAt = new Date();

  await session.save();

  const io = req.app.get('io');
  if (io) {
    io.to(orderId).emit('locationUpdate', {
      orderId,
      lat,
      lng,
      etaMinutes: session.etaMinutes,
      status: session.status,
    });
  }

  res.status(200).json(new ApiResponse(200, session, 'Location updated'));
});

exports.addTrackingPoint = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { lat, lng, speed, heading, accuracy } = req.body;

  const session = await TrackingSession.findOne({ orderId });
  if (!session) throw new ApiError(404, 'Tracking session not found');

  const point = await TrackingPoint.create({
    sessionId: session._id,
    orderId,
    driverId: req.user._id,
    lat,
    lng,
    speed,
    heading,
    accuracy,
  });

  session.currentLocation = { lat, lng };
  session.lastUpdatedAt = new Date();
  await session.save();

  res.status(201).json(new ApiResponse(201, point, 'Tracking point added'));
});

exports.getTrackingSession = asyncHandler(async (req, res) => {
  const session = await TrackingSession.findOne({ orderId: req.params.orderId });
  if (!session) throw new ApiError(404, 'Tracking session not found');

  res.status(200).json(new ApiResponse(200, session, 'Tracking session fetched'));
});

exports.stopTracking = asyncHandler(async (req, res) => {
  const session = await TrackingSession.findOne({ orderId: req.params.orderId });
  if (!session) throw new ApiError(404, 'Tracking session not found');

  session.status = 'delivered';
  session.endedAt = new Date();
  await session.save();

  res.status(200).json(new ApiResponse(200, session, 'Tracking stopped'));
});