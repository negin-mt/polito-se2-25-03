/**
 * Q2.5 API Test Script
 * Tests the REST API endpoints for Q2.5: Counter Operations
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test configuration
const testConfig = {
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logTest(message) {
    log(`🧪 ${message}`, 'cyan');
}

async function runQ25Tests() {
    log('='.repeat(60), 'bright');
    log('🏢 Office Queue Management API - Q2.5 Test Suite', 'bright');
    log('='.repeat(60), 'bright');
    
    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Health Check
    totalTests++;
    logTest('Test 1: Health Check');
    try {
        const response = await axios.get(`${BASE_URL}/health`, testConfig);
        if (response.status === 200 && response.data.status === 'OK') {
            logSuccess('Health check passed');
            passedTests++;
        } else {
            logError('Health check failed - unexpected response');
        }
    } catch (error) {
        logError(`Health check failed: ${error.message}`);
    }

    // Test 2: Create test tickets for queue operations
    totalTests++;
    logTest('Test 2: Create Test Tickets');
    try {
        // Create multiple tickets for testing
        const ticketPromises = [];
        for (let i = 0; i < 3; i++) {
            ticketPromises.push(
                axios.post(`${BASE_URL}/tickets`, { serviceTypeId: 1 }, testConfig)
            );
        }
        
        const responses = await Promise.all(ticketPromises);
        const tickets = responses.map(r => r.data.data);
        
        if (tickets.every(t => t.ticketId && t.ticketNumber)) {
            logSuccess(`Created ${tickets.length} test tickets`);
            logInfo(`Tickets: ${tickets.map(t => t.ticketNumber).join(', ')}`);
            passedTests++;
            
            // Store tickets for next tests
            global.testTickets = tickets;
        } else {
            logError('Failed to create test tickets');
        }
    } catch (error) {
        logError(`Create test tickets failed: ${error.message}`);
    }

    // Test 3: POST /api/counters/{counterId}/call-next - Success Case
    totalTests++;
    logTest('Test 3: Call Next Customer - Success');
    try {
        if (!global.testTickets || global.testTickets.length === 0) {
            logError('Skipping - no test tickets available');
        } else {
            const response = await axios.post(`${BASE_URL}/counters/1/call-next`, {
                officerId: 'officer1'
            }, testConfig);
            
            if (response.status === 200 && response.data.success && response.data.ticket) {
                logSuccess(`Called next customer: ${response.data.ticket.ticketNumber}`);
                logInfo(`Counter: ${response.data.counter.counterNumber}, Service: ${response.data.ticket.serviceType}`);
                passedTests++;
                
                // Store the serving ticket for next tests
                global.servingTicket = response.data.ticket;
            } else {
                logError('Call next customer failed - unexpected response');
            }
        }
    } catch (error) {
        logError(`Call next customer failed: ${error.message}`);
    }

    // Test 4: GET /api/counters/{counterId}/current-ticket - Success Case
    totalTests++;
    logTest('Test 4: Get Current Ticket - Success');
    try {
        const response = await axios.get(`${BASE_URL}/counters/1/current-ticket`, {
            ...testConfig,
            headers: {
                ...testConfig.headers,
                'x-officer-id': 'officer1'
            }
        });
        
        if (response.status === 200 && response.data.ticket) {
            logSuccess(`Retrieved current ticket: ${response.data.ticket.ticketNumber}`);
            logInfo(`Called at: ${response.data.ticket.calledAt}`);
            passedTests++;
        } else {
            logError('Get current ticket failed - unexpected response');
        }
    } catch (error) {
        logError(`Get current ticket failed: ${error.message}`);
    }

    // Test 5: POST /api/tickets/{ticketId}/complete - Success Case
    totalTests++;
    logTest('Test 5: Complete Ticket - Success');
    try {
        if (!global.servingTicket) {
            logError('Skipping - no serving ticket available');
        } else {
            const response = await axios.post(`${BASE_URL}/tickets/${global.servingTicket.ticketId}/complete`, {
                officerId: 'officer1'
            }, testConfig);
            
            if (response.status === 200 && response.data.success && response.data.completedAt) {
                logSuccess(`Completed ticket: ${global.servingTicket.ticketNumber}`);
                logInfo(`Completed at: ${response.data.completedAt}`);
                passedTests++;
            } else {
                logError('Complete ticket failed - unexpected response');
            }
        }
    } catch (error) {
        logError(`Complete ticket failed: ${error.message}`);
    }

    // Test 6: POST /api/counters/{counterId}/call-next - No Customers Case
    totalTests++;
    logTest('Test 6: Call Next Customer - No Customers');
    try {
        // Try to call next customer when no one is waiting
        const response = await axios.post(`${BASE_URL}/counters/2/call-next`, {
            officerId: 'officer1'
        }, testConfig);
        
        if (response.status === 200 && !response.data.success && response.data.message === 'No customers in queue') {
            logSuccess('Correctly handled no customers case');
            logInfo(`Queue length: ${response.data.queueLength}`);
            passedTests++;
        } else {
            logError('No customers case failed - unexpected response');
        }
    } catch (error) {
        logError(`No customers case failed: ${error.message}`);
    }

    // Test 7: POST /api/counters/{counterId}/call-next - Counter Already Serving
    totalTests++;
    logTest('Test 7: Call Next Customer - Counter Already Serving');
    try {
        // First, call a customer to counter 1
        await axios.post(`${BASE_URL}/counters/1/call-next`, {
            officerId: 'officer1'
        }, testConfig);
        
        // Try to call another customer to the same counter
        const response = await axios.post(`${BASE_URL}/counters/1/call-next`, {
            officerId: 'officer1'
        }, testConfig);
        
        if (response.status === 400 && !response.data.success && response.data.error === 'Counter is already serving a customer') {
            logSuccess('Correctly handled counter already serving case');
            logInfo(`Current ticket: ${response.data.currentTicket}`);
            passedTests++;
        } else {
            logError('Counter already serving case failed - unexpected response');
        }
    } catch (error) {
        logError(`Counter already serving case failed: ${error.message}`);
    }

    // Test 8: Authorization - Missing Officer ID
    totalTests++;
    logTest('Test 8: Authorization - Missing Officer ID');
    try {
        await axios.post(`${BASE_URL}/counters/1/call-next`, {}, testConfig);
        logError('Expected 401 error for missing officer ID');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            logSuccess('Correctly returned 401 for missing officer ID');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 9: Authorization - Unauthorized Officer
    totalTests++;
    logTest('Test 9: Authorization - Unauthorized Officer');
    try {
        await axios.post(`${BASE_URL}/counters/1/call-next`, {
            officerId: 'unauthorized_officer'
        }, testConfig);
        logError('Expected 403 error for unauthorized officer');
    } catch (error) {
        if (error.response && error.response.status === 403) {
            logSuccess('Correctly returned 403 for unauthorized officer');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 10: Authorization - Wrong Counter Access
    totalTests++;
    logTest('Test 10: Authorization - Wrong Counter Access');
    try {
        await axios.post(`${BASE_URL}/counters/5/call-next`, {
            officerId: 'officer1' // officer1 can only access counters 1,2
        }, testConfig);
        logError('Expected 403 error for wrong counter access');
    } catch (error) {
        if (error.response && error.response.status === 403) {
            logSuccess('Correctly returned 403 for wrong counter access');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 11: GET /api/counters/{counterId}/current-ticket - No Ticket
    totalTests++;
    logTest('Test 11: Get Current Ticket - No Ticket');
    try {
        const response = await axios.get(`${BASE_URL}/counters/3/current-ticket`, {
            ...testConfig,
            headers: {
                ...testConfig.headers,
                'x-officer-id': 'officer2'
            }
        });
        
        if (response.status === 200 && response.data.ticket === null) {
            logSuccess('Correctly returned null for counter with no current ticket');
            passedTests++;
        } else {
            logError('No ticket case failed - unexpected response');
        }
    } catch (error) {
        logError(`No ticket case failed: ${error.message}`);
    }

    // Test 12: Input Validation - Invalid Counter ID
    totalTests++;
    logTest('Test 12: Input Validation - Invalid Counter ID');
    try {
        await axios.post(`${BASE_URL}/counters/invalid/call-next`, {
            officerId: 'officer1'
        }, testConfig);
        logError('Expected 400 error for invalid counter ID');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            logSuccess('Correctly returned 400 for invalid counter ID');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 13: Input Validation - Non-existent Counter
    totalTests++;
    logTest('Test 13: Input Validation - Non-existent Counter');
    try {
        await axios.post(`${BASE_URL}/counters/999/call-next`, {
            officerId: 'officer1'
        }, testConfig);
        logError('Expected 404 error for non-existent counter');
    } catch (error) {
        if (error.response && error.response.status === 404) {
            logSuccess('Correctly returned 404 for non-existent counter');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 14: Input Validation - Invalid Ticket ID
    totalTests++;
    logTest('Test 14: Input Validation - Invalid Ticket ID');
    try {
        await axios.post(`${BASE_URL}/tickets/invalid/complete`, {
            officerId: 'officer1'
        }, testConfig);
        logError('Expected 400 error for invalid ticket ID');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            logSuccess('Correctly returned 400 for invalid ticket ID');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test Results Summary
    log('='.repeat(60), 'bright');
    log('📊 Q2.5 Test Results Summary', 'bright');
    log('='.repeat(60), 'bright');
    
    if (passedTests === totalTests) {
        logSuccess(`All ${totalTests} tests passed! 🎉`);
    } else {
        logError(`${passedTests}/${totalTests} tests passed`);
    }
    
    log(`\n📚 API Documentation: http://localhost:3001/api-docs`, 'yellow');
    log(`📋 Health Check: http://localhost:3001/api/health`, 'yellow');
    log('='.repeat(60), 'bright');
}

// Run tests
if (require.main === module) {
    runQ25Tests().catch(error => {
        logError(`Test suite failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runQ25Tests };
