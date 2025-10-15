// testTicketService.js
const { TicketRepository } = require("../repository/TicketRepository.js");
const dayjs = require("dayjs");
const { TicketNumberGenerator } = require('../utils/ticketNumberGenerator');
const ticketNumberGenerator = new TicketNumberGenerator();

(async () => {
  const ticketRepository = new TicketRepository();

  try {
      await ticketNumberGenerator.connect();
      const ticketNumber = await ticketNumberGenerator.generateTicketNumber(1);

      const ticketData = {
          ticket_number: 'AOO1',            // lo genererai nella repository o nel service
          service_type_id: 1,
          status: 'WAITING',              // valore iniziale
          counter_id: null,
          issued_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          called_at: null,
          completed_at: null,
          cancelled_at: null,
          notes: null
      };
    console.log("👉 Creating a new ticket for serviceTypeId = 1 (Banking Services)");
    const newTicket = await ticketRepository.createTicket(ticketData);
    console.log("✅ Ticket created successfully:\n", newTicket);

    console.log("\n👉 Fetching ticket info...");
    const info = await ticketRepository.getTicketById(newTicket);
    console.log("ℹ️ Ticket info:\n", info);

    //console.log("\n👉 Fetching queue status for serviceTypeId = 1...");
      // const status = await ticketRepository.getQueueStatus(1);
    //console.log("📊 Queue status:\n", status);

  } catch (err) {
    console.error("❌ Error during test:", err.message);
  }
})();
