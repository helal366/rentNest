import { prisma } from "../../lib/prisma";

const getAllUsersServices=async()=>{
    const users = await prisma.user.findMany({
        select:{
            id:true,
            name: true,
            email: true,
            role: true,
            userStatus:true
        },
        orderBy:{
            createdAt:"desc"
        }
    });
    return users
};

const getAllPropertiesServices=async()=>{
    const properties = await prisma.property.findMany({
        omit:{
            isDeleted: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy:{
            rentPrice:"asc"
        }
    });
    return properties
}
export const adminServices={
    getAllUsersServices,
    getAllPropertiesServices
}