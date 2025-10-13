/**
 * API Test Script
 * Tests the REST API endpoints for Q1: Get Ticket
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

async function runTests() {
    log('='.repeat(60), 'bright');
    log('🏢 Office Queue Management API - Test Suite', 'bright');
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

    // Test 2: Get Service Types
    totalTests++;
    logTest('Test 2: Get Service Types');
    try {
        const response = await axios.get(`${BASE_URL}/service-types`, testConfig);
        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            logSuccess(`Retrieved ${response.data.count} service types`);
            logInfo(`Services: ${response.data.data.map(s => s.name).join(', ')}`);
            passedTests++;
        } else {
            logError('Get service types failed - unexpected response');
        }
    } catch (error) {
        logError(`Get service types failed: ${error.message}`);
    }

    // Test 3: Issue Ticket
    totalTests++;
    logTest('Test 3: Issue Ticket');
    try {
        const response = await axios.post(`${BASE_URL}/tickets`, {
            serviceTypeId: 1
        }, testConfig);
        
        if (response.status === 201 && response.data.success && response.data.data.ticketId) {
            const ticket = response.data.data;
            logSuccess(`Ticket issued: ${ticket.ticketNumber} (ID: ${ticket.ticketId})`);
            logInfo(`Service: ${ticket.serviceType.name}, Position: ${ticket.queuePosition}`);
            passedTests++;
            
            // Store ticket info for next tests
            global.testTicket = ticket;
        } else {
            logError('Issue ticket failed - unexpected response');
        }
    } catch (error) {
        logError(`Issue ticket failed: ${error.message}`);
    }

    // Test 4: Get Ticket by ID
    totalTests++;
    logTest('Test 4: Get Ticket by ID');
    try {
        if (!global.testTicket) {
            logError('Skipping - no test ticket available');
        } else {
            const response = await axios.get(`${BASE_URL}/tickets/${global.testTicket.ticketId}`, testConfig);
            if (response.status === 200 && response.data.success && response.data.data.id === global.testTicket.ticketId) {
                logSuccess(`Retrieved ticket: ${response.data.data.ticket_number}`);
                passedTests++;
            } else {
                logError('Get ticket by ID failed - unexpected response');
            }
        }
    } catch (error) {
        logError(`Get ticket by ID failed: ${error.message}`);
    }

    // Test 5: Get Ticket by Number
    totalTests++;
    logTest('Test 5: Get Ticket by Number');
    try {
        if (!global.testTicket) {
            logError('Skipping - no test ticket available');
        } else {
            const response = await axios.get(`${BASE_URL}/tickets/number/${global.testTicket.ticketNumber}`, testConfig);
            if (response.status === 200 && response.data.success && response.data.data.ticket_number === global.testTicket.ticketNumber) {
                logSuccess(`Retrieved ticket by number: ${response.data.data.ticket_number}`);
                passedTests++;
            } else {
                logError('Get ticket by number failed - unexpected response');
            }
        }
    } catch (error) {
        logError(`Get ticket by number failed: ${error.message}`);
    }

    // Test 6: Get Queue Status
    totalTests++;
    logTest('Test 6: Get Queue Status');
    try {
        const response = await axios.get(`${BASE_URL}/queue/status/1`, testConfig);
        if (response.status === 200 && response.data.success && typeof response.data.data.waitingTickets === 'number') {
            const status = response.data.data;
            logSuccess(`Queue status: ${status.waitingTickets} waiting, ${status.activeCounters} counters`);
            if (status.estimatedWaitTime) {
                logInfo(`Estimated wait: ${status.estimatedWaitTime} minutes`);
            }
            passedTests++;
        } else {
            logError('Get queue status failed - unexpected response');
        }
    } catch (error) {
        logError(`Get queue status failed: ${error.message}`);
    }

    // Test 7: Validation Error - Invalid Service Type
    totalTests++;
    logTest('Test 7: Validation Error - Invalid Service Type');
    try {
        await axios.post(`${BASE_URL}/tickets`, {
            serviceTypeId: 999
        }, testConfig);
        logError('Expected 404 error for invalid service type');
    } catch (error) {
        if (error.response && error.response.status === 404) {
            logSuccess('Correctly returned 404 for invalid service type');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 8: Validation Error - Missing Service Type
    totalTests++;
    logTest('Test 8: Validation Error - Missing Service Type');
    try {
        await axios.post(`${BASE_URL}/tickets`, {}, testConfig);
        logError('Expected 400 error for missing service type');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            logSuccess('Correctly returned 400 for missing service type');
            passedTests++;
        } else {
            logError(`Unexpected error: ${error.message}`);
        }
    }

    // Test 9: Cancel Ticket (if we have one)
    totalTests++;
    logTest('Test 9: Cancel Ticket');
    try {
        if (!global.testTicket) {
            logError('Skipping - no test ticket available');
        } else {
            const response = await axios.patch(`${BASE_URL}/tickets/${global.testTicket.ticketId}/cancel`, {}, testConfig);
            if (response.status === 200 && response.data.success && response.data.data.status === 'CANCELLED') {
                logSuccess(`Ticket cancelled: ${response.data.data.ticketNumber}`);
                passedTests++;
            } else {
                logError('Cancel ticket failed - unexpected response');
            }
        }
    } catch (error) {
        logError(`Cancel ticket failed: ${error.message}`);
    }

    // Test Results Summary
    log('='.repeat(60), 'bright');
    log('📊 Test Results Summary', 'bright');
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
    runTests().catch(error => {
        logError(`Test suite failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runTests };
