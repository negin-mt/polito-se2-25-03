const CounterDAO = require('../dao/CounterDAO.js');

class CounterRepository {
    constructor() {
        this.dao = CounterDAO;
    }

    async getAllCounters() {
        return await this.dao.getAllCounters();
    }

    async getCounterById(id) {
        const counter = await this.dao.getCounterById(id);
        if (!counter) {
            throw new Error(`Counter with id '${id}' not found`);
        }
        return counter;
    }

    async getActiveCountersByServiceType(serviceTypeId) {
        return await this.dao.getActiveCountersByServiceType(serviceTypeId);
    }

    async countActiveCountersByServiceType(serviceTypeId) {
        return await this.dao.countActiveCountersByServiceType(serviceTypeId);
    }

    async updateCounterStatus(counterId, isActive) {
        return await this.dao.updateCounterStatus(counterId, isActive);
    }

    async getServingCounters(serviceTypeId = null) {
        return await this.dao.getServingCounters(serviceTypeId);
    }
}

module.exports = { CounterRepository };

