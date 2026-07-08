import { prisma } from "../../lib/prisma"

const getAllCategoriesServices=async()=>{
    const categoryDetails = await prisma.category.findMany({
        select:{
            id:true,
            name: true
        }
    });
    let categories:string[]=[];
    categoryDetails.map(cat=>{
        categories.push(cat.name)
    })
    return {categories}
}
export const categoryServices={
    getAllCategoriesServices
}