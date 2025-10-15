const TicketDAO = require('../dao/TicketDAO.js');

class TicketRepository{
    constructor () {
        this.dao = TicketDAO;
    }

    async createTicket(ticketData) {
        const existing = await this.dao.findByTicketNumber(ticketData.ticket_number);
        if (existing) {
            throw new Error(`Ticket with number '${ticketData.ticket_number}' already exists`);
        }
        return await this.dao.addTicket(
            ticketData.ticket_number,
            ticketData.service_type_id,
            ticketData.status,
            ticketData.counter_id,
            ticketData.issued_at,
            ticketData.called_at,
            ticketData.completed_at,
            ticketData.cancelled_at,
            ticketData.notes
        );
    }

    async getAllTickets() {
        return await this.dao.getAllTickets();
    }

    async getTicketById(id) {
        const ticket = await this.dao.getTicketById(id);
        if (!ticket) {
            throw new Error(`Ticket with id '${id}' not found`);
        }
        return ticket;
    }

    async findTicketByTicketNumber(number) {
        return await this.dao.findByTicketNumber(number);
    }

    async findTicketByServiceType(service_type_id) {
        return await this.dao.findWaitingTicketsByServiceType(service_type_id);
    }

    async findTicketByStatus(status) {
        return await this.dao.findTicketsByStatus(status);
    }

    async getNextInQueue(service_type_id) {
        const next = await this.dao.getNextInQueue(service_type_id);
        if (!next) {
            throw new Error(`No waiting tickets found for service type '${service_type_id}'`);
        }
        return next;
    }

    async deleteTicket(id, timestamp){
        return await this.dao.deleteTicket(id, timestamp);
    }

    async getQueueStatus(serviceTypeId) {
        return await this.dao.getQueueStatus(serviceTypeId);
    }
// ---- NEW: Q2.2
  async findNextWaitingTicket(serviceTypeId) {
    return await this.dao.findNextWaitingTicket(serviceTypeId);
  }

  async findCurrentTicketForCounter(counterId) {
    return await this.dao.findCurrentTicketForCounter(counterId);
  }

  async findTicketsByCounter(counterId, status) {
    return await this.dao.findTicketsByCounter(counterId, status);
  }

  async updateTicketToServing(ticketId, counterId, officerName) {
    const changes = await this.dao.updateTicketToServing(ticketId, counterId, officerName);
    if (changes === 0) throw new Error(`Ticket '${ticketId}' not found or not updated`);
    return await this.getTicketById(ticketId);
  }

  async completeTicket(ticketId) {
    const changes = await this.dao.completeTicket(ticketId);
    if (changes === 0) throw new Error(`Ticket '${ticketId}' not found or not updated`);
    return await this.getTicketById(ticketId);
  }

}

module.exports = { TicketRepository };