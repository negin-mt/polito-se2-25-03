const express = require('express');
const { CounterRepository } = require('../repository/CounterRepository');
const router = express.Router();
const counterRepository = new CounterRepository();

// GET /api/counters - Get all counters
router.get('/', async (req, res) => {
  try {
    const counters = await counterRepository.getAllCounters();
    res.json({ success: true, data: counters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/counters/:id - Get counter by ID
router.get('/:id', async (req, res) => {
  try {
    const counter = await counterRepository.getCounterById(parseInt(req.params.id));
    res.json({ success: true, data: counter });
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// GET /api/counters/service/:serviceTypeId - Get active counters for a service type
router.get('/service/:serviceTypeId', async (req, res) => {
  try {
    const counters = await counterRepository.getActiveCountersByServiceType(parseInt(req.params.serviceTypeId));
    res.json({ success: true, data: counters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/counters/serving/all - Get all counters currently serving
router.get('/serving/all', async (req, res) => {
  try {
    const counters = await counterRepository.getServingCounters();
    res.json({ success: true, data: counters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/counters/:id/status - Update counter active status
router.patch('/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    
    const result = await counterRepository.updateCounterStatus(parseInt(req.params.id), isActive);
    res.json({ 
      success: true, 
      message: `Counter ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { changes: result }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

