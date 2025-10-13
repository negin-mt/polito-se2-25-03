import * as TicketDAO from '../dao/TicketDAO.mjs'

export class TicketRepository{
    constructor (dao) {
        this.dao = TicketDAO;
    }

    async createTicket(ticketData) {
        const existing = await this.dao.findByTicketNumber(ticketData.ticket_number);
        if (existing) {
            throw new Error(`Ticket with number '${ticketData.ticket_number}' already exists`);
        }
        return await this.dao.addTicket(
            ticketData.status,
            ticketData.created_at,
            ticketData.predicted_hour,
            ticketData.service_id,
            ticketData.counter_id,
            ticketData.ticket_number
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
}