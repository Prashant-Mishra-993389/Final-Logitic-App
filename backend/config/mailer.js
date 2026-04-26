const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // 🔥 THIS IS THE KEY FIX
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;