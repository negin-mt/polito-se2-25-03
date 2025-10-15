const express = require('express');
const { TicketRepository } = require('../repository/TicketRepository');
const router = express.Router();
const ticketRepository = new TicketRepository();
const { QueueRepository } = require('../repository/QueueRepository');
const queueRepository = new QueueRepository();

router.get('/status/:serviceTypeId', async (req, res) => {
  try {
    const serviceTypeId = parseInt(req.params.serviceTypeId);
    if (!serviceTypeId || serviceTypeId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid service type ID' });
    }
    
    const status = await ticketRepository.getQueueStatus(serviceTypeId);
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// GET next waiting by service type
router.get('/next/:serviceTypeId', async (req, res) => {
  try {
    const serviceTypeId = Number(req.params.serviceTypeId);
    const ticket = await ticketRepository.findNextWaitingTicket(serviceTypeId);
    res.json({ success: true, data: ticket });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST: mark as SERVING
router.post('/:ticketId/serve', async (req, res) => {
  try {
    const { counterId, officerName } = req.body;
    const ticket = await ticketRepository.updateTicketToServing(
      Number(req.params.ticketId),
      Number(counterId),
      officerName ?? null
    );
    res.json({ success: true, data: ticket });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST: complete
router.post('/:ticketId/complete', async (req, res) => {
  try {
    const ticket = await ticketRepository.completeTicket(Number(req.params.ticketId));
    res.json({ success: true, data: ticket });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET ticket history by counter
router.get('/counter/:counterId', async (req, res) => {
  try {
    const counterId = parseInt(req.params.counterId);
    const status = req.query.status || null; // puoi filtrare per status

    const tickets = await ticketRepository.findTicketsByCounter(counterId, status);
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Call Next Customer (Q2.4)
router.post('/call-next/:counterId', async (req, res) => {
  try {
    const counterId = parseInt(req.params.counterId);
    const response = await queueRepository.callNextCustomer(counterId);
    res.json(response);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


//Get current ticket being served at a counter (Q2.4)
router.get('/current-ticket/:counterId', async (req, res) => {
  try {
    const counterId = parseInt(req.params.counterId);
    const ticket = await queueRepository.getCurrentTicket(counterId);
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


//Complete a service and free the counter (Q2.4)
router.post('/complete-service/:ticketId', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const result = await queueRepository.completeService(ticketId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
module.exports = router;
