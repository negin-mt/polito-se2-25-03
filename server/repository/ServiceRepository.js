import * as SercviceDAO from '../dao/ServiceDAO'

export class ServiceRepository{
    constructor(){
        this.dao = SercviceDAO;
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
