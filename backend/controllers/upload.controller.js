const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'File is required');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'service-files');

  res.status(200).json(
    new ApiResponse(200, {
      url: result.secure_url,
      public_id: result.public_id,
    }, 'File uploaded')
  );
});