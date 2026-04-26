const Review = require('../models/Review');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createReview = asyncHandler(async (req, res) => {
  const { orderId, revieweeId, rating, comment, tags } = req.body;

  if (!orderId || !revieweeId || !rating) {
    throw new ApiError(400, 'orderId, revieweeId and rating are required');
  }

  const review = await Review.create({
    orderId,
    reviewerId: req.user._id,
    revieweeId,
    rating,
    comment: comment || '',
    tags: tags || [],
  });

  const workerProfile = await WorkerProfile.findOne({ userId: revieweeId });
  if (workerProfile) {
    workerProfile.ratingSum += rating;
    workerProfile.ratingCount += 1;
    await workerProfile.save();
  }

  res.status(201).json(new ApiResponse(201, review, 'Review created'));
});

exports.getReviewsByUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ revieweeId: req.params.userId })
    .populate('reviewerId', 'name email role')
    .populate({
      path: 'orderId',
      populate: { path: 'categoryId', select: 'name' }
    })
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

exports.getReviewsByOrder = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ orderId: req.params.orderId })
    .populate('reviewerId revieweeId', 'name email role')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
});