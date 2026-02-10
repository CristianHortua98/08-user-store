import { CustomError } from "../errors/custom.error";


export class CategoryEntity {

    constructor(
        public id: string,
        public name: string,
        public available: boolean
    ){}

    static fromObject(object: {[key: string]: any}){

        const { _id, id, name, available } = object;

        if(!id || !_id){
            throw CustomError.badRequest('Mising id');
        }

        if(!name){
            throw CustomError.badRequest('Mising name');
        }


        return new CategoryEntity(id || _id, name, available);
    }

}