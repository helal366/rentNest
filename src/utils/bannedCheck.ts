import { UserStatus } from "#db-client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js"
import { AppError } from "./globalErrorHelper.js";

export const bannedCheck=async(id:string)=>{
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if(user && user.userStatus===UserStatus.BANNED){
        throw new AppError(`This ${user.role} is BANNED`, StatusCodes.FORBIDDEN)
    }
}