import { envs } from "../../config";
import { CategoryModel, MongoDatabase, ProductModel, UserModel } from "../mongo";
import { seedData } from "./data";


(async () => {

    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL
    });

    await main();

    await MongoDatabase.disconnect();

})();

const randomBetween0AndX = (x: number) => {
    return Math.floor(Math.random() * x);
}


async function main(){

    //BORRAR TODO
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany()
    ]);

    //CREAR USUARIOS
    const users = await UserModel.insertMany(seedData.users);

    //CREAR CATEGORIAS
    const categories = await CategoryModel.insertMany(seedData.categories.map(category => {
        return {
            ...category,
            user: users[0]._id
        }
    }));


    //CREAR PRODUCTOS
    const products = await ProductModel.insertMany(seedData.products.map(product => {
        return {
            ...product,
            user: users[randomBetween0AndX(seedData.users.length - 1)]._id,
            category: categories[randomBetween0AndX(seedData.categories.length - 1)]._id,
        }
    }))


}