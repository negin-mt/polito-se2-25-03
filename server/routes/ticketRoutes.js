const express = require('express');
const router = express.Router();
const TicketService = require('../src/services/TicketServices');
const ticketService = new TicketService();

// POST /api/tickets
router.post('/', async (req, res) => {
  try {
    const { serviceTypeId } = req.body;

    if (!Number.isInteger(serviceTypeId) || serviceTypeId <= 0)
      return res.status(400).json({ success: false, message: 'Invalid serviceTypeId' });

    const ticket = await ticketService.issueTicket(serviceTypeId);
    res.status(201).json({ success: true, message: 'Ticket issued successfully', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await ticketService.getTicketInfo(parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//  GET /api/tickets/number/:ticketNumber
router.get('/number/:ticketNumber', async (req, res) => {
  try {
    const ticket = await ticketService.getTicketByNumber(req.params.ticketNumber);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/tickets/:id/cancel
router.patch('/:id/cancel', async (req, res) => {
  try {
    const result = await ticketService.cancelTicket(parseInt(req.params.id));
    res.json({ success: true, message: 'Ticket cancelled successfully', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
