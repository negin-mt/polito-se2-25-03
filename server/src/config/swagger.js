/**
 * Swagger/OpenAPI Configuration
 * Office Queue Management System - Q1: Get Ticket
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Office Queue Management System API',
            version: '1.0.0',
            description: `
                REST API for the Office Queue Management System - Story Q1: Get Ticket
                
                This API provides endpoints for:
                - Ticket generation and management
                - Queue status monitoring
                - Service type management
                - Customer ticket lookup
                
                ## Authentication
                Currently no authentication is required for Q1 implementation.
                
                ## Error Handling
                All endpoints return consistent error responses with appropriate HTTP status codes.
            `,
            contact: {
                name: 'Development Team',
                email: 'dev@company.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Development server'
            },
            {
                url: 'https://api.company.com/api',
                description: 'Production server'
            }
        ],
        components: {
            schemas: {
                ServiceType: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                            description: 'Unique identifier for the service type'
                        },
                        name: {
                            type: 'string',
                            example: 'Banking Services',
                            description: 'Human-readable name of the service'
                        },
                        code: {
                            type: 'string',
                            example: 'A',
                            description: 'Service code used in ticket number generation'
                        },
                        description: {
                            type: 'string',
                            example: 'General banking operations, deposits, withdrawals',
                            description: 'Detailed description of the service'
                        },
                        average_service_time: {
                            type: 'integer',
                            example: 10,
                            description: 'Average service time in minutes'
                        },
                        is_active: {
                            type: 'boolean',
                            example: true,
                            description: 'Whether the service is currently available'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-01-10T10:00:00Z'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-01-10T10:00:00Z'
                        }
                    }
                },
                Ticket: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 123,
                            description: 'Unique ticket identifier'
                        },
                        ticket_number: {
                            type: 'string',
                            example: 'A042',
                            description: 'Display ticket number'
                        },
                        service_type_id: {
                            type: 'integer',
                            example: 1,
                            description: 'Associated service type ID'
                        },
                        status: {
                            type: 'string',
                            enum: ['WAITING', 'SERVING', 'COMPLETED', 'CANCELLED'],
                            example: 'WAITING',
                            description: 'Current ticket status'
                        },
                        counter_id: {
                            type: 'integer',
                            nullable: true,
                            example: 3,
                            description: 'Assigned counter ID (null if waiting)'
                        },
                        queue_position: {
                            type: 'integer',
                            example: 5,
                            description: 'Position in queue for this service'
                        },
                        issued_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-01-10T14:30:00Z',
                            description: 'When the ticket was issued'
                        },
                        called_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2025-01-10T14:45:00Z',
                            description: 'When the ticket was called to counter'
                        },
                        completed_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2025-01-10T15:00:00Z',
                            description: 'When the service was completed'
                        },
                        cancelled_at: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2025-01-10T14:35:00Z',
                            description: 'When the ticket was cancelled'
                        },
                        notes: {
                            type: 'string',
                            nullable: true,
                            example: 'Customer requested specific assistance',
                            description: 'Additional notes'
                        },
                        serviceType: {
                            $ref: '#/components/schemas/ServiceType'
                        }
                    }
                },
                QueueStatus: {
                    type: 'object',
                    properties: {
                        serviceTypeId: {
                            type: 'integer',
                            example: 1,
                            description: 'Service type ID'
                        },
                        serviceTypeName: {
                            type: 'string',
                            example: 'Banking Services',
                            description: 'Service type name'
                        },
                        waitingTickets: {
                            type: 'integer',
                            example: 5,
                            description: 'Number of tickets waiting in queue'
                        },
                        activeCounters: {
                            type: 'integer',
                            example: 3,
                            description: 'Number of active counters for this service'
                        },
                        lastTicketNumber: {
                            type: 'string',
                            nullable: true,
                            example: 'A042',
                            description: 'Last ticket number in queue'
                        },
                        estimatedWaitTime: {
                            type: 'integer',
                            nullable: true,
                            example: 15,
                            description: 'Estimated wait time in minutes'
                        }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                            description: 'Indicates if the request was successful'
                        },
                        message: {
                            type: 'string',
                            example: 'Operation completed successfully',
                            description: 'Human-readable message'
                        },
                        data: {
                            type: 'object',
                            description: 'Response data (varies by endpoint)'
                        },
                        error: {
                            type: 'string',
                            example: 'Validation Error',
                            description: 'Error type (only present when success is false)'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                            description: 'Always false for error responses'
                        },
                        error: {
                            type: 'string',
                            example: 'Validation Error',
                            description: 'Error type'
                        },
                        message: {
                            type: 'string',
                            example: 'serviceTypeId is required',
                            description: 'Detailed error message'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints'
            },
            {
                name: 'Service Types',
                description: 'Service type management'
            },
            {
                name: 'Tickets',
                description: 'Ticket generation and management'
            },
            {
                name: 'Queue',
                description: 'Queue status and monitoring'
            }
        ]
    },
    apis: ['./index.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
