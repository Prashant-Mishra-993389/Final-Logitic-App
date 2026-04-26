const express = require('express');
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket
} = require('../controllers/support.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/', protect, createTicket);
router.get('/', protect, authorize('admin'), getAllTickets);
router.get('/my', protect, getMyTickets);
router.get('/:id', protect, getTicketById);

router.patch('/:id/status', protect, authorize('admin'), updateTicketStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignTicket);

module.exports = router;