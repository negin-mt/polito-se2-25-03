// /**
//  * Office Queue Management System - REST API Server
//  * Q1: Get Ticket / Ticket Generation
//  * 
//  * This server provides REST API endpoints for ticket generation and management.
//  */

// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpecs = require('./src/config/swagger');
// const TicketService = require('./src/services/TicketServices');

// // Initialize Express app
// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Initialize Ticket Service
// const ticketService = new TicketService();

// // ============================================
// // API Documentation (Swagger)
// // ============================================

// // Serve Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
//     customCss: '.swagger-ui .topbar { display: none }',
//     customSiteTitle: 'Office Queue Management API Documentation',
//     swaggerOptions: {
//         persistAuthorization: true,
//         displayRequestDuration: true,
//         filter: true,
//         showExtensions: true,
//         showCommonExtensions: true
//     }
// }));

// // Serve raw OpenAPI JSON
// app.get('/api-docs.json', (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(swaggerSpecs);
// });

// // ============================================
// // API Routes
// // ============================================

// /**
//  * @swagger
//  * /health:
//  *   get:
//  *     summary: Health check endpoint
//  *     description: Check if the API server is running and healthy
//  *     tags: [Health]
//  *     responses:
//  *       200:
//  *         description: Server is healthy
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: OK
//  *                 message:
//  *                   type: string
//  *                   example: Office Queue Management API is running
//  *                 timestamp:
//  *                   type: string
//  *                   format: date-time
//  *                   example: 2025-01-10T14:30:00Z
//  */
// app.get('/api/health', (req, res) => {
//     res.json({
//         status: 'OK',
//         message: 'Office Queue Management API is running',
//         timestamp: new Date().toISOString()
//     });
// });

// /**
//  * @swagger
//  * /service-types:
//  *   get:
//  *     summary: Get all active service types
//  *     description: Retrieve a list of all active service types available for ticket generation
//  *     tags: [Service Types]
//  *     responses:
//  *       200:
//  *         description: List of active service types
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/ServiceType'
//  *                 count:
//  *                   type: integer
//  *                   example: 4
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.get('/api/service-types', async (req, res) => {
//     try {
//         const serviceTypes = await ticketService.getActiveServiceTypes();
//         res.json({
//             success: true,
//             data: serviceTypes,
//             count: serviceTypes.length
//         });
//     } catch (error) {
//         console.error('Error fetching service types:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Failed to fetch service types',
//             message: error.message
//         });
//     }
// });

// // Alias endpoint for frontend compatibility
// app.get('/api/services', async (req, res) => {
//     try {
//         const serviceTypes = await ticketService.getActiveServiceTypes();
//         res.json(serviceTypes); // Return data directly (frontend expects this format)
//     } catch (error) {
//         console.error('Error fetching services:', error);
//         res.status(500).json({
//             error: 'Failed to fetch services',
//             // message: error.message
//         });
//     }
// });

// /**
//  * @swagger
//  * /tickets:
//  *   post:
//  *     summary: Issue a new ticket
//  *     description: Create a new ticket for the specified service type and add it to the queue
//  *     tags: [Tickets]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - serviceTypeId
//  *             properties:
//  *               serviceTypeId:
//  *                 type: integer
//  *                 example: 1
//  *                 description: ID of the service type for which to issue the ticket
//  *           examples:
//  *             banking_service:
//  *               summary: Banking Service Ticket
//  *               value:
//  *                 serviceTypeId: 1
//  *             support_service:
//  *               summary: Support Service Ticket
//  *               value:
//  *                 serviceTypeId: 2
//  *     responses:
//  *       201:
//  *         description: Ticket issued successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Ticket issued successfully
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     ticketId:
//  *                       type: integer
//  *                       example: 123
//  *                     ticketNumber:
//  *                       type: string
//  *                       example: A042
//  *                     serviceType:
//  *                       type: object
//  *                       properties:
//  *                         id:
//  *                           type: integer
//  *                           example: 1
//  *                         name:
//  *                           type: string
//  *                           example: Banking Services
//  *                         code:
//  *                           type: string
//  *                           example: A
//  *                     status:
//  *                       type: string
//  *                       example: WAITING
//  *                     issuedAt:
//  *                       type: string
//  *                       format: date-time
//  *                       example: 2025-01-10T14:30:00Z
//  *                     queuePosition:
//  *                       type: integer
//  *                       example: 5
//  *                     estimatedWaitingTickets:
//  *                       type: integer
//  *                       example: 4
//  *       400:
//  *         description: Validation error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       404:
//  *         description: Service type not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.post('/api/tickets', async (req, res) => {
//     try {
//         const { serviceTypeId } = req.body;

//         // Input validation
//         if (!serviceTypeId) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'serviceTypeId is required'
//             });
//         }

//         if (!Number.isInteger(serviceTypeId) || serviceTypeId <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'serviceTypeId must be a positive integer'
//             });
//         }

//         // Issue ticket
//         const ticket = await ticketService.issueTicket(serviceTypeId);

//         res.status(201).json({
//             success: true,
//             message: 'Ticket issued successfully',
//             data: {
//                 ticketId: ticket.ticketId,
//                 ticketNumber: ticket.ticketNumber,
//                 serviceType: ticket.serviceType,
//                 status: ticket.status,
//                 issuedAt: ticket.issuedAt,
//                 queuePosition: ticket.queuePosition,
//                 estimatedWaitingTickets: ticket.estimatedWaitingTickets
//             }
//         });

//     } catch (error) {
//         console.error('Error issuing ticket:', error);
        
//         if (error.message.includes('not found') || error.message.includes('inactive')) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Service Type Not Found',
//                 message: error.message
//             });
//         }

//         res.status(500).json({
//             success: false,
//             error: 'Failed to issue ticket',
//             message: error.message
//         });
//     }
// });

// /**
//  * @swagger
//  * /tickets/{id}:
//  *   get:
//  *     summary: Get ticket information by ID
//  *     description: Retrieve detailed information about a specific ticket using its unique ID
//  *     tags: [Tickets]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           example: 123
//  *         description: Unique ticket identifier
//  *     responses:
//  *       200:
//  *         description: Ticket information retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   $ref: '#/components/schemas/Ticket'
//  *       400:
//  *         description: Validation error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       404:
//  *         description: Ticket not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.get('/api/tickets/:id', async (req, res) => {
//     try {
//         const ticketId = parseInt(req.params.id);

//         // Input validation
//         if (!Number.isInteger(ticketId) || ticketId <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'Ticket ID must be a positive integer'
//             });
//         }

//         const ticket = await ticketService.getTicketInfo(ticketId);

//         if (!ticket) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Ticket Not Found',
//                 message: `Ticket with ID ${ticketId} not found`
//             });
//         }

//         res.json({
//             success: true,
//             data: ticket
//         });

//     } catch (error) {
//         console.error('Error fetching ticket info:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Failed to fetch ticket information',
//             message: error.message
//         });
//     }
// });

// /**
//  * @swagger
//  * /tickets/number/{ticketNumber}:
//  *   get:
//  *     summary: Get ticket information by ticket number
//  *     description: Retrieve ticket information using the display ticket number (e.g., A001, B042)
//  *     tags: [Tickets]
//  *     parameters:
//  *       - in: path
//  *         name: ticketNumber
//  *         required: true
//  *         schema:
//  *           type: string
//  *           pattern: '^[A-Z]\d{3}$'
//  *           example: A042
//  *         description: Ticket number in format [Letter][3 digits]
//  *     responses:
//  *       200:
//  *         description: Ticket information retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   $ref: '#/components/schemas/Ticket'
//  *       400:
//  *         description: Validation error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       404:
//  *         description: Ticket not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.get('/api/tickets/number/:ticketNumber', async (req, res) => {
//     try {
//         const { ticketNumber } = req.params;

//         // Input validation
//         if (!ticketNumber || ticketNumber.trim() === '') {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'Ticket number is required'
//             });
//         }

//         // Validate ticket number format (e.g., A001, B042)
//         const ticketNumberPattern = /^[A-Z]\d{3}$/;
//         if (!ticketNumberPattern.test(ticketNumber)) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'Ticket number must be in format [Letter][3 digits] (e.g., A001, B042)'
//             });
//         }

//         const ticket = await ticketService.getTicketByNumber(ticketNumber.toUpperCase());

//         if (!ticket) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Ticket Not Found',
//                 message: `Ticket ${ticketNumber.toUpperCase()} not found`
//             });
//         }

//         res.json({
//             success: true,
//             data: ticket
//         });

//     } catch (error) {
//         console.error('Error fetching ticket by number:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Failed to fetch ticket information',
//             message: error.message
//         });
//     }
// });

// /**
//  * @swagger
//  * /queue/status/{serviceTypeId}:
//  *   get:
//  *     summary: Get queue status for a service type
//  *     description: Retrieve current queue status including waiting tickets, active counters, and estimated wait time
//  *     tags: [Queue]
//  *     parameters:
//  *       - in: path
//  *         name: serviceTypeId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           example: 1
//  *         description: Service type identifier
//  *     responses:
//  *       200:
//  *         description: Queue status retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   $ref: '#/components/schemas/QueueStatus'
//  *       400:
//  *         description: Validation error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       404:
//  *         description: Service type not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.get('/api/queue/status/:serviceTypeId', async (req, res) => {
//     try {
//         const serviceTypeId = parseInt(req.params.serviceTypeId);

//         // Input validation
//         if (!Number.isInteger(serviceTypeId) || serviceTypeId <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'serviceTypeId must be a positive integer'
//             });
//         }

//         const queueStatus = await ticketService.getQueueStatus(serviceTypeId);

//         res.json({
//             success: true,
//             data: queueStatus
//         });

//     } catch (error) {
//         console.error('Error fetching queue status:', error);
        
//         if (error.message.includes('not found') || error.message.includes('inactive')) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Service Type Not Found',
//                 message: error.message
//             });
//         }

//         res.status(500).json({
//             success: false,
//             error: 'Failed to fetch queue status',
//             message: error.message
//         });
//     }
// });

// /**
//  * @swagger
//  * /tickets/{id}/cancel:
//  *   patch:
//  *     summary: Cancel a ticket
//  *     description: Cancel an existing ticket and remove it from the queue
//  *     tags: [Tickets]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           example: 123
//  *         description: Unique ticket identifier
//  *     responses:
//  *       200:
//  *         description: Ticket cancelled successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Ticket cancelled successfully
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     ticketId:
//  *                       type: integer
//  *                       example: 123
//  *                     ticketNumber:
//  *                       type: string
//  *                       example: A042
//  *                     status:
//  *                       type: string
//  *                       example: CANCELLED
//  *                     cancelledAt:
//  *                       type: string
//  *                       format: date-time
//  *                       example: 2025-01-10T14:35:00Z
//  *                     message:
//  *                       type: string
//  *                       example: Ticket cancelled successfully
//  *       400:
//  *         description: Validation error or invalid operation
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       404:
//  *         description: Ticket not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// app.patch('/api/tickets/:id/cancel', async (req, res) => {
//     try {
//         const ticketId = parseInt(req.params.id);

//         // Input validation
//         if (!Number.isInteger(ticketId) || ticketId <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation Error',
//                 message: 'Ticket ID must be a positive integer'
//             });
//         }

//         const result = await ticketService.cancelTicket(ticketId);

//         res.json({
//             success: true,
//             message: 'Ticket cancelled successfully',
//             data: result
//         });

//     } catch (error) {
//         console.error('Error cancelling ticket:', error);
        
//         if (error.message.includes('not found')) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Ticket Not Found',
//                 message: error.message
//             });
//         }

//         if (error.message.includes('already cancelled') || error.message.includes('Cannot cancel')) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Invalid Operation',
//                 message: error.message
//             });
//         }

//         res.status(500).json({
//             success: false,
//             error: 'Failed to cancel ticket',
//             message: error.message
//         });
//     }
// });

// // ============================================
// // Error Handling Middleware
// // ============================================

// // Handle 404 - Route not found
// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         error: 'Route Not Found',
//         message: `Route ${req.method} ${req.originalUrl} not found`,
//         availableRoutes: [
//             'GET /api/health',
//             'GET /api/service-types',
//             'POST /api/tickets',
//             'GET /api/tickets/:id',
//             'GET /api/tickets/number/:ticketNumber',
//             'GET /api/queue/status/:serviceTypeId',
//             'PATCH /api/tickets/:id/cancel'
//         ]
//     });
// });

// // Global error handler
// app.use((error, req, res, next) => {
//     console.error('Unhandled error:', error);
//     res.status(500).json({
//         success: false,
//         error: 'Internal Server Error',
//         message: 'An unexpected error occurred'
//     });
// });

// // ============================================
// // Server Startup
// // ============================================

// // Graceful shutdown
// process.on('SIGINT', async () => {
//     console.log('\nReceived SIGINT. Gracefully shutting down...');
//     await ticketService.close();
//     process.exit(0);
// });

// process.on('SIGTERM', async () => {
//     console.log('\nReceived SIGTERM. Gracefully shutting down...');
//     await ticketService.close();
//     process.exit(0);
// });

// // Start server
// app.listen(PORT, () => {
//     console.log('='.repeat(70));
//     console.log('🏢 Office Queue Management System API Server');
//     console.log('='.repeat(70));
//     console.log(`📡 Server running on port ${PORT}`);
//     console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
//     console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
//     console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
//     console.log('='.repeat(70));
//     console.log('📚 Available Endpoints:');
//     console.log('  GET    /api/health                    - Health check');
//     console.log('  GET    /api/service-types             - Get active service types');
//     console.log('  GET    /api/services                  - Get active service types (frontend alias)');
//     console.log('  POST   /api/tickets                   - Issue new ticket');
//     console.log('  GET    /api/tickets/:id               - Get ticket by ID');
//     console.log('  GET    /api/tickets/number/:number    - Get ticket by number');
//     console.log('  GET    /api/queue/status/:serviceId   - Get queue status');
//     console.log('  PATCH  /api/tickets/:id/cancel        - Cancel ticket');
//     console.log('='.repeat(70));
//     console.log('📖 Documentation:');
//     console.log(`  📄 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
//     console.log(`  🌐 Swagger UI: http://localhost:${PORT}/api-docs`);
//     console.log('='.repeat(70));
// });

// module.exports = app;

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const routes = require('./routes'); // <-- unico punto di montaggio

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get('/api/health', (req, res) => res.json({ status: 'OK', ts: new Date().toISOString() }));

app.use('/api', routes);            // <-- tutte le route montate qui

// 404 & error handler alla fine
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
module.exports = app;
