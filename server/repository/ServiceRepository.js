const ServiceDAO = require('../dao/ServiceDAO');

class ServiceRepository{
    constructor(){
        this.dao = ServiceDAO;
    }

    async getAllServices(){
        return await this.dao.getAllServices();
    }

    async getService(id){
        return await this.dao.getService(id);
    }

    async getActiveServices(){
        return await this.dao.getActiveServices();
    }
}

module.exports = { ServiceRepository }
