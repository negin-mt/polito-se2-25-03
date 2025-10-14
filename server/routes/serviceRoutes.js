const express = require('express');
const router = express.Router();
const TicketService = require('../src/services/TicketServices');
const ticketService = new TicketService();

router.get('/type', async (req, res) => {
  try {
    const services = await ticketService.getActiveServiceTypes();
    res.json({ success: true, data: services, count: services.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// alias /api/services
router.get('/alias', async (req, res) => {
  try {
    const services = await ticketService.getActiveServiceTypes();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
