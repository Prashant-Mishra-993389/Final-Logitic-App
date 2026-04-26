const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  verifyOtp 
} = require('../controllers/auth.controller');

const { protect } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOtp);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/update', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;