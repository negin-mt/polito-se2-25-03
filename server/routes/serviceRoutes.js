const express = require('express');
const router = express.Router();
const { ServiceRepository } = require('../repository/ServiceRepository');
const ticketRepository = new ServiceRepository();

router.get('/type', async (req, res) => {
  try {
    console.log("Fetching active services...");
    const services = await ticketRepository.getActiveServices();
    res.json({ success: true, data: services, count: services.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// alias /api/services
router.get('/alias', async (req, res) => {
  try {
    console.log("Fetching active services...");
    const services = await ticketRepository.getActiveServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
