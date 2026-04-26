const SupportTicket = require('../models/SupportTicket');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createTicket = asyncHandler(async (req, res) => {
  const { orderId, category, priority, subject, description } = req.body;

  if (!subject || !description) {
    throw new ApiError(400, 'Subject and description are required');
  }

  const ticket = await SupportTicket.create({
    userId: req.user._id,
    orderId: orderId || null,
    category: category || 'other',
    priority: priority || 'medium',
    subject,
    description,
  });

  res.status(201).json(new ApiResponse(201, ticket, 'Ticket created'));
});

exports.getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, tickets, 'Tickets fetched'));
});

exports.getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, tickets, 'All tickets fetched'));
});

exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  res.status(200).json(new ApiResponse(200, ticket, 'Ticket fetched'));
});

exports.updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  ticket.status = req.body.status || ticket.status;
  ticket.resolutionNotes = req.body.resolutionNotes || ticket.resolutionNotes;
  await ticket.save();

  res.status(200).json(new ApiResponse(200, ticket, 'Ticket updated'));
});

exports.assignTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  ticket.assignedTo = req.body.assignedTo;
  await ticket.save();

  res.status(200).json(new ApiResponse(200, ticket, 'Ticket assigned'));
});