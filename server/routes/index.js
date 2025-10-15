const express = require('express');
const router = express.Router();

router.use('/tickets', require('./ticketRoutes'));
router.use('/service', require('./serviceRoutes'));
router.use('/queue', require('./queueRoutes'));
router.use('/counters', require('./counterRoutes'));

module.exports = router;
