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
Q2.5: Counter Operations without affecting existing functionality.

## Implemented Endpoints

### 1. POST /api/counters/{counterId}/call-next
**Purpose**: Call the next customer in queue for a specific counter

**Request**:
- Path: `counterId` (integer)
- Body: `{ "officerId": "string" }`

**Success Response (HTTP 200)**:
```json
{
  "success": true,
  "ticket": {
    "ticketId": 123,
    "ticketNumber": "A042",
    "serviceType": "Banking",
    "issuedAt": "2025-10-10T14:30:00Z",
    "calledAt": "2025-10-10T14:45:00Z"
  },
  "counter": {
    "counterId": 5,
    "counterNumber": 5
  }
}
```

**No Customers Response (HTTP 200)**:
```json
{
  "success": false,
  "message": "No customers in queue",
  "queueLength": 0
}
```

**Error Response (HTTP 400)**:
```json
{
  "success": false,
  "error": "Counter is already serving a customer",
  "currentTicket": "A041"
}
```

### 2. GET /api/counters/{counterId}/current-ticket
**Purpose**: Get the currently serving ticket at a counter

**Request**:
- Path: `counterId` (integer)
- Headers: `x-officer-id: string`

**Response**:
```json
{
  "ticket": {
    "ticketNumber": "A042",
    "issuedAt": "2025-10-10T14:30:00Z",
    "calledAt": "2025-10-10T14:45:00Z"
  }
}
```

**Or null if no ticket**:
```json
{
  "ticket": null
}
```

### 3. POST /api/tickets/{ticketId}/complete
**Purpose**: Mark a ticket as completed and free up the counter

**Request**:
- Path: `ticketId` (integer)
- Body: `{ "officerId": "string" }`

**Response**:
```json
{
  "success": true,
  "completedAt": "2025-10-10T14:50:00Z"
}
```

## Features Implemented

### ✅ Input Validation
- Counter ID validation (must be positive integer)
- Ticket ID validation (must be positive integer)
- Officer ID validation (required for authorization)
- Counter existence validation
- Ticket existence validation

### ✅ Authorization
- Officer-based authorization system
- Officers can only operate their assigned counters:
  - `officer1`: Counters 1, 2
  - `officer2`: Counters 3, 4
  - `officer3`: Counter 5
- HTTP 401 for missing authorization
- HTTP 403 for unauthorized access

### ✅ Proper HTTP Status Codes
- 200: Success
- 400: Bad Request (validation errors, business logic errors)
- 401: Unauthorized (missing authorization)
- 403: Forbidden (unauthorized access)
- 404: Not Found (non-existent resources)
- 500: Internal Server Error

### ✅ Integration Tests
Comprehensive test suite covering:
- Success scenarios for all endpoints
- Error handling (no customers, counter already serving)
- Authorization testing (missing, unauthorized, wrong counter)
- Input validation testing
- Edge cases and boundary conditions

## Files Modified/Created

### Modified Files:
1. **`server/routes/counterRoutes.js`**
   - Added POST `/api/counters/{counterId}/call-next` endpoint
   - Added GET `/api/counters/{counterId}/current-ticket` endpoint
   - Added authorization and validation logic

2. **`server/routes/ticketRoutes.js`**
   - Added POST `/api/tickets/{ticketId}/complete` endpoint
   - Added authorization and validation logic

### Created Files:
1. **`server/test-q2-5-api.js`**
   - Comprehensive integration test suite
   - 14 test cases covering all scenarios
   - Color-coded output for easy reading

## Testing

Run the test suite:
```bash
cd server
node test-q2-5-api.js
```

The test suite validates:
- All success scenarios
- Error handling
- Authorization mechanisms
- Input validation
- Edge cases

## Authorization Model

The system implements a simple but effective authorization model:
- Officers are identified by `officerId` in request body or `x-officer-id` header
- Each officer is assigned to specific counters
- Officers can only perform operations on their assigned counters
- This prevents unauthorized access and maintains security

## Backward Compatibility

✅ **No existing functionality was affected**
- All existing endpoints continue to work unchanged
- New endpoints are additive only
- Database schema remains unchanged
- Existing tests continue to pass

## Usage Examples

### Call Next Customer
```bash
curl -X POST http://localhost:3001/api/counters/1/call-next \
  -H "Content-Type: application/json" \
  -d '{"officerId": "officer1"}'
```

### Get Current Ticket
```bash
curl -X GET http://localhost:3001/api/counters/1/current-ticket \
  -H "x-officer-id: officer1"
```

### Complete Ticket
```bash
curl -X POST http://localhost:3001/api/tickets/123/complete \
  -H "Content-Type: application/json" \
  -d '{"officerId": "officer1"}'
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
