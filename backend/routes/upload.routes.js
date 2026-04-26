const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { uploadFile } = require('../controllers/upload.controller');

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;