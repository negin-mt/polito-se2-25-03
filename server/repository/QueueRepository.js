const { TicketRepository } = require('./TicketRepository');
const { CounterRepository } = require('./CounterRepository');

class QueueRepository {
  constructor() {
    this.ticketRepository = new TicketRepository();
    this.counterRepository = new CounterRepository();
  }

  /**
   * Call the next customer for a given counter.
   */
  async callNextCustomer(counterId) {
    // Validate counter exists and is OPEN
    const counter = await this.counterRepository.getCounterById(counterId);
    if (!counter) {
      throw new Error(`Counter ${counterId} not found`);
    }
    if (counter.is_active !== 1) { // Assuming 1 means OPEN
      return { success: false, error: `Counter ${counterId} is closed` };
    }

    // Check if counter already serving
    const currentTicket = await this.ticketRepository.findCurrentTicketForCounter(counterId);
    console.log(currentTicket);
    if (currentTicket) {
      return {
        success: false,
        error: 'Counter is already serving a customer',
        currentTicket,
      };
    }

    //Get counter's service type
    const serviceTypeId = counter.service_type_id;
    if (!serviceTypeId) {
      throw new Error(`Counter ${counterId} has no assigned service type`);
    }

    // Find next WAITING ticket (FIFO)
    const nextTicket = await this.ticketRepository.findNextWaitingTicket(serviceTypeId);
    if (!nextTicket) {
      return {
        success: false,
        message: 'No customers in queue',
        queueLength: 0,
      };
    }

    // Update ticket to SERVING
    const updatedTicket = await this.ticketRepository.updateTicketToServing(
      nextTicket.id,
      counterId,
      counter.officer_name || 'Unknown Officer'
    );

    //Return unified response
    return {
      success: true,
      ticket: updatedTicket,
      counter: {
        counterId: counter.id,
        counterNumber: counter.counter_number,
      },
    };
  }

  /**
   * Get the current ticket being served at a counter.
   */
  async getCurrentTicket(counterId) {
    const ticket = await this.ticketRepository.findCurrentTicketForCounter(counterId);
    return ticket || null;
  }

  /**
   * Complete a service for a given ticket.
   */
  async completeService(ticketId) {
    const updated = await this.ticketRepository.completeTicket(ticketId);
    return {
      success: true,
      completedAt: updated.completed_at,
      ticket: updated,
    };
  }
}

module.exports = { QueueRepository };
