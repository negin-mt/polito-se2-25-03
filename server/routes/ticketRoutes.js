const express = require('express');
const dayjs = require('dayjs');
const { TicketRepository } = require('../repository/TicketRepository');
const { TicketNumberGenerator } = require('../utils/ticketNumberGenerator');
const router = express.Router();
const ticketRepository = new TicketRepository();
const ticketNumberGenerator = new TicketNumberGenerator();

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await ticketRepository.getAllTickets();
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  try {
    const { serviceTypeId } = req.body;

    if (!Number.isInteger(serviceTypeId) || serviceTypeId <= 0)
      return res.status(400).json({ success: false, message: 'Invalid serviceTypeId' });

    // Connect to database for ticket number generation
    await ticketNumberGenerator.connect();
    const ticketNumberResult = await ticketNumberGenerator.generateTicketNumber(serviceTypeId);

    const ticketData = {
        ticket_number: ticketNumberResult.ticketNumber,            // lo genererai nella repository o nel service
        service_type_id: serviceTypeId,
        status: 'WAITING',              // valore iniziale
        counter_id: null,
        issued_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        called_at: null,
        completed_at: null,
        cancelled_at: null,
        notes: null
    };

    const ticketId = await ticketRepository.createTicket(ticketData);
    const ticket = await ticketRepository.getTicketById(ticketId);
    res.status(201).json({ success: true, message: 'Ticket issued successfully', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    // Close database connection
    try {
      await ticketNumberGenerator.close();
    } catch (closeErr) {
      console.error('Error closing ticket number generator:', closeErr);
    }
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await ticketRepository.getTicketById(parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//  GET /api/tickets/number/:ticketNumber
router.get('/number/:ticketNumber', async (req, res) => {
  try {
    const ticket = await ticketRepository.findTicketByTicketNumber(req.params.ticketNumber);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/tickets/:id/cancel
router.patch('/:id/cancel', async (req, res) => {
  try {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const result = await ticketRepository.deleteTicket(parseInt(req.params.id), timestamp);
    res.json({ success: true, message: 'Ticket cancelled successfully', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
