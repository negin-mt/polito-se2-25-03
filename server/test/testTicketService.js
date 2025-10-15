// testTicketService.js
const { TicketRepository } = require("../repository/TicketRepository.js");
const dayjs = require("dayjs");
const { TicketNumberGenerator } = require('../utils/ticketNumberGenerator');

(async () => {
  const ticketRepository = new TicketRepository();
  const ticketNumberGenerator = new TicketNumberGenerator();

  try {
    // Connect to the ticket number generator
    await ticketNumberGenerator.connect();
    
    // Generate a unique ticket number for service type 1
    const ticketInfo = await ticketNumberGenerator.generateTicketNumber(1);
    console.log("🎫 Generated ticket number:", ticketInfo.ticketNumber);

    const ticketData = {
        ticket_number: ticketInfo.ticketNumber,
        service_type_id: 1,
        status: 'WAITING',
        counter_id: null,
        issued_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        called_at: null,
        completed_at: null,
        cancelled_at: null,
        notes: null
    };
    
    console.log("\n👉 Creating a new ticket for serviceTypeId = 1 (Banking Services)");
    const newTicket = await ticketRepository.createTicket(ticketData);
    console.log("✅ Ticket created successfully:\n", newTicket);

    console.log("\n👉 Fetching ticket info...");
    const info = await ticketRepository.getTicketById(newTicket);
    console.log("ℹ️ Ticket info:\n", info);

    console.log("\n👉 Fetching queue status for serviceTypeId = 1...");
    const status = await ticketRepository.getQueueStatus(1);
    console.log("📊 Queue status:\n", status);

  } catch (err) {
    console.error("❌ Error during test:", err.message);
  } finally {
    // Always close the database connection
    await ticketNumberGenerator.close();
  }
})();
