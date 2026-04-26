const express = require('express');
const router = express.Router();

router.get('/maps', (req, res) => {
  res.status(200).json({
    success: true,
    apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

module.exports = router;
