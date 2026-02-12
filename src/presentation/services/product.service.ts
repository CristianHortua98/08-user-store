import { ProductModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto, ProductEntity } from "../../domain";


export class ProductService {

    constructor(){}
    
    async createProduct(createProductDto: CreateProductDto){

        const productExists = await ProductModel.findOne({name: createProductDto.name});

        if(productExists){
            throw CustomError.badRequest('Product already exists');
        }

        try{

            const product = new ProductModel(createProductDto);

            await product.save();

            return product;
            
        }catch(error){
            throw CustomError.internalServer(`${error}`);
        }


    }

    async getProducts(paginationDto: PaginationDto){
        
        const { page, limit } = paginationDto;

        try{

            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                    .skip(( page - 1 ) * limit)
                    .limit(limit)
                    .populate('user') //Traer informacion de la tabla User con la relacion
                    .populate('category') //Traer informacion de la tabla Category con la relacion
            ]);


            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/products?page=${(page + 1)}&limit=${limit}`,
                prev: (page - 1 > 0) ? `/api/products?page=${(page - 1)}&limit=${limit}` : ``,
                // products: products.map(product => ProductEntity.fromObject(product)),
                products: products,
            };
            
        }catch(error){

            throw CustomError.internalServer('Internal server error');
            
        }

    }

}