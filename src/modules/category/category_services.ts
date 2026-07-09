import { prisma } from "../../lib/prisma.js"
import { ICategory } from "./category_interfaces.js";

const getAllCategoriesServices=async()=>{
    const categoryDetails = await prisma.category.findMany({
        select:{
            id:true,
            name: true
        }
    });
    let categories:string[]=[];
    categoryDetails.map((cat:ICategory)=>{
        categories.push(cat.name)
    })
    return {categories}
}
export const categoryServices={
    getAllCategoriesServices
}