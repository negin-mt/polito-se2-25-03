# Office Queue Management System - REST API

## Overview

This is the REST API server for the Office Queue Management System, implementing Story Q1: Get Ticket / Ticket Generation.

## Features

- ✅ Ticket generation with unique numbering
- ✅ Queue management and status monitoring
- ✅ Service type management
- ✅ Comprehensive API documentation
- ✅ Input validation and error handling
- ✅ Database integration with SQLite

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Server Information

- **Port**: 3001 (default)
- **Base URL**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`
- **API Documentation**: `http://localhost:3001/api-docs`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Service Types
- **GET** `/api/service-types` - Get all active service types

### Tickets
- **POST** `/api/tickets` - Issue a new ticket
- **GET** `/api/tickets/:id` - Get ticket by ID
- **GET** `/api/tickets/number/:ticketNumber` - Get ticket by ticket number
- **PATCH** `/api/tickets/:id/cancel` - Cancel a ticket

### Queue Management
- **GET** `/api/queue/status/:serviceTypeId` - Get queue status for a service type

## Usage Examples

### Issue a New Ticket

```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"serviceTypeId": 1}'
```

Response:
```json
{
  "success": true,
  "message": "Ticket issued successfully",
  "data": {
    "ticketId": 123,
    "ticketNumber": "A042",
    "serviceType": {
      "id": 1,
      "name": "Banking Services",
      "code": "A"
    },
    "status": "WAITING",
    "issuedAt": "2025-01-10T14:30:00Z",
    "queuePosition": 5,
    "estimatedWaitingTickets": 4
  }
}
```

### Get Ticket Information

```bash
curl http://localhost:3001/api/tickets/123
```

### Get Queue Status

```bash
curl http://localhost:3001/api/queue/status/1
```

Response:
```json
{
  "success": true,
  "data": {
    "serviceTypeId": 1,
    "serviceTypeName": "Banking Services",
    "waitingTickets": 5,
    "activeCounters": 3,
    "lastTicketNumber": "A042",
    "estimatedWaitTime": 15
  }
}
```

## Testing

Run the API test suite:
```bash
npm run test:api
```

This will test all endpoints and validate the API functionality.

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI JSON**: `http://localhost:3001/api-docs.json`

## Database Schema

The system uses SQLite with the following main tables:

- **service_types**: Available services (Banking, Support, etc.)
- **counters**: Physical service counters
- **tickets**: Issued tickets with queue management

See `db/DATA_MODEL.md` for detailed schema information.

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "serviceTypeId is required"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (ticket issued)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Project Structure

```
server/
├── index.js                 # Main Express server
├── src/
│   ├── services/
│   │   └── TicketServices.js # Business logic
│   ├── utils/
│   │   └── ticketNumberGenerator.js # Ticket numbering
│   └── config/
│       └── swagger.js       # API documentation
├── db/
│   ├── schema.sql           # Database schema
│   └── init.js              # Database initialization
├── test-api.js              # API test suite
└── package.json
```

### Adding New Endpoints

1. Add route handler in `index.js`
2. Add Swagger documentation
3. Update test suite in `test-api.js`

### Database Operations

The system uses:
- **TicketService**: Main business logic
- **TicketRepository**: Database operations for tickets
- **ServiceRepository**: Database operations for service types
- **CounterRepository**: Database operations for counters

## Story Q1 Implementation Status

✅ **Q1.5: Ticket Service Layer** - Complete
- Enhanced service methods
- Proper error handling
- Queue management

✅ **Q1.6: REST API Endpoints** - Complete
- All required endpoints implemented
- Input validation
- Consistent error responses

✅ **Q1.7: API Documentation** - Complete
- Swagger/OpenAPI documentation
- Interactive API explorer
- Request/response examples

## Support

For issues or questions, please refer to the project documentation or contact the development team.
