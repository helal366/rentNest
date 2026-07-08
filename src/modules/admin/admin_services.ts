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
export const adminServices={
    getAllUsersServices
}