import { CustomError } from "../errors/custom.error";


export class ProductEntity {

    constructor(
        public id: string,
        public name: string,
        public available: boolean,
        public price: number,
        public description: string,
        public user: string,
        public category: string
    ){}

    static fromObject(object: {[key: string]: any}){

        const { _id, id, name, available, price, description, user, category } = object;

        if(!id || !_id){
            throw CustomError.badRequest('Missing id');
        }

        if(!name){
            throw CustomError.badRequest('Missing name');
        }

        if(!price){
            throw CustomError.badRequest('Missing price');
        }

        if(!description){
            throw CustomError.badRequest('Missing description');
        }

        if(!user){
            throw CustomError.badRequest('Missing user');
        }

        if(!category){
            throw CustomError.badRequest('Missing category');
        }

    }


}