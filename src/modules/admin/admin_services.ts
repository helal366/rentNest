import { StatusCodes } from "http-status-codes";
import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/globalErrorHelper";

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

const updateUserBanUnbanServices=async(userId:string, userStatus: UserStatus)=>{
    const user = await prisma.user.findUniqueOrThrow({
        where:{id:userId},
        select: {
            id:true,
            name: true,
            email: true,
            role: true,
            userStatus: true
        }
    });
    if(user.userStatus === userStatus){
        throw new AppError("Already updated to the required status",StatusCodes.BAD_REQUEST)
    };
    const updatedUser=prisma.user.update({
        where:{id:userId},
        data:{
            userStatus
        },
    });
    return updatedUser
}
export const adminServices={
    getAllUsersServices,
    getAllPropertiesServices,
    getAllRentalRequestsServices,
    updateUserBanUnbanServices
}