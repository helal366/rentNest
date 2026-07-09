import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { validateUserStatus } from "../../helperFunction/userStatusvalidityCheck.js";

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
};

const getAllRentalRequestsServices=async()=>{
    const rentalRequests = await prisma.rentalRequest.findMany();
    return rentalRequests
};

const updateUserBanUnbanServices=async(userId:string, userStatus: string)=>{
    const validStatus=validateUserStatus(userStatus)
    const user = await prisma.user.findUniqueOrThrow({
        where:{id:userId}
    });
    if(user.userStatus === validStatus){
        throw new AppError("Already updated to the required status",StatusCodes.BAD_REQUEST)
    };
    const updatedUser=await prisma.user.update({
        where:{id:userId},
        data:{
            userStatus: validStatus
        },
        select: {
            id:true,
            name: true,
            email: true,
            role: true,
            userStatus: true
        }
    });
    return updatedUser
}
export const adminServices={
    getAllUsersServices,
    getAllPropertiesServices,
    getAllRentalRequestsServices,
    updateUserBanUnbanServices
}