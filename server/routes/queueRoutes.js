const express = require('express');
const { TicketRepository } = require('../repository/TicketRepository');
const router = express.Router();
const ticketRepository = new TicketRepository();

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

module.exports = router;
