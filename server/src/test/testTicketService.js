// testTicketService.js
const TicketService = require("../services/TicketServices");

(async () => {
  const service = new TicketService();

  try {
    console.log("👉 Creating a new ticket for serviceTypeId = 1 (Banking Services)");
    const newTicket = await service.issueTicket(1);
    console.log("✅ Ticket created successfully:\n", newTicket);

    console.log("\n👉 Fetching ticket info...");
    const info = await service.getTicketInfo(newTicket.id);
    console.log("ℹ️ Ticket info:\n", info);

    console.log("\n👉 Fetching queue status for serviceTypeId = 1...");
    const status = await service.getQueueStatus(1);
    console.log("📊 Queue status:\n", status);

  } catch (err) {
    console.error("❌ Error during test:", err.message);
  }
})();
