const express = require('express');
const { CounterRepository } = require('../repository/CounterRepository');
const { QueueRepository } = require('../repository/QueueRepository');
const router = express.Router();
const counterRepository = new CounterRepository();
const queueRepository = new QueueRepository();

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

// POST /api/counters/{counterId}/call-next - Call next customer for a counter
router.post('/:counterId/call-next', async (req, res) => {
  try {
    const counterId = parseInt(req.params.counterId);
    const { officerId } = req.body; // Authorization: officer can only call from their counter
    
    // Input validation
    if (!counterId || counterId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid counter ID' 
      });
    }

    // Authorization check - officer can only call from their counter
    if (!officerId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization required: officerId is required' 
      });
    }

    // Check if counter exists
    let counter;
    try {
      counter = await counterRepository.getCounterById(counterId);
    } catch (err) {
      return res.status(404).json({ 
        success: false, 
        error: `Counter ${counterId} not found` 
      });
    }

    // Basic authorization: officer can only operate their assigned counter
    // For now, we'll use a simple mapping. In a real system, this would be more sophisticated
    const authorizedCounters = {
      'officer1': [1, 2],
      'officer2': [3, 4], 
      'officer3': [5]
    };
    
    if (!authorizedCounters[officerId] || !authorizedCounters[officerId].includes(counterId)) {
      return res.status(403).json({ 
        success: false, 
        error: `Officer ${officerId} is not authorized to operate counter ${counterId}` 
      });
    }

    const response = await queueRepository.callNextCustomer(counterId);
    
    // Return appropriate response based on the result
    if (response.success) {
      res.status(200).json({
        success: true,
        ticket: {
          ticketId: response.ticket.id,
          ticketNumber: response.ticket.ticket_number,
          serviceType: response.ticket.service_name || 'Unknown Service',
          issuedAt: response.ticket.issued_at,
          calledAt: response.ticket.called_at
        },
        counter: {
          counterId: response.counter.counterId,
          counterNumber: response.counter.counterNumber
        }
      });
    } else {
      // Handle different error cases
      if (response.error === 'Counter is already serving a customer') {
        res.status(400).json({
          success: false,
          error: response.error,
          currentTicket: response.currentTicket?.ticket_number
        });
      } else if (response.message === 'No customers in queue') {
        res.status(200).json({
          success: false,
          message: response.message,
          queueLength: response.queueLength
        });
      } else {
        res.status(400).json({
          success: false,
          error: response.error || 'Unknown error occurred'
        });
      }
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// GET /api/counters/{counterId}/current-ticket - Get currently serving ticket
router.get('/:counterId/current-ticket', async (req, res) => {
  try {
    const counterId = parseInt(req.params.counterId);
    const officerId = req.headers['x-officer-id']; // Authorization header
    
    // Input validation
    if (!counterId || counterId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid counter ID' 
      });
    }

    // Authorization check - officer can only access their counter
    if (!officerId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization required: x-officer-id header is required' 
      });
    }

    // Check if counter exists
    try {
      await counterRepository.getCounterById(counterId);
    } catch (err) {
      return res.status(404).json({ 
        success: false, 
        error: `Counter ${counterId} not found` 
      });
    }

    // Basic authorization: officer can only access their assigned counter
    const authorizedCounters = {
      'officer1': [1, 2],
      'officer2': [3, 4], 
      'officer3': [5]
    };
    
    if (!authorizedCounters[officerId] || !authorizedCounters[officerId].includes(counterId)) {
      return res.status(403).json({ 
        success: false, 
        error: `Officer ${officerId} is not authorized to access counter ${counterId}` 
      });
    }

    const ticket = await queueRepository.getCurrentTicket(counterId);
    
    if (ticket) {
      res.json({
        ticket: {
          ticketNumber: ticket.ticket_number,
          issuedAt: ticket.issued_at,
          calledAt: ticket.called_at
        }
      });
    } else {
      res.json({ ticket: null });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;

