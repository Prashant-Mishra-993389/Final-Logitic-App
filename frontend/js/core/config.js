// js/core/config.js — Environment configuration

export const CONFIG = {
  API_BASE: 'http://localhost:5000/api',
  BASE_URL:  'http://localhost:5000',
  APP_NAME:  'IndustrialServ',
  VERSION:   '1.0.0',

  // Socket
  SOCKET_URL: 'http://localhost:5000',

  // Pagination
  PAGE_SIZE: 10,

  // Upload
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg','image/jpg','image/png','image/webp'],
  ALLOWED_DOC_TYPES:   ['application/pdf','image/jpeg','image/png'],

  // Razorpay
  RAZORPAY_KEY: 'rzp_test_RuNrgdCHsyUsJ8',
};
