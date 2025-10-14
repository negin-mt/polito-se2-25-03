const express = require('express');
const router = express.Router();
const TicketService = require('../src/services/TicketServices');
const ticketService = new TicketService();

router.get('/status/:serviceTypeId', async (req, res) => {
  try {
    const serviceTypeId = parseInt(req.params.serviceTypeId);
    const status = await ticketService.getQueueStatus(serviceTypeId);
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
