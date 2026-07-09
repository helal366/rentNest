import { StatusCodes } from "http-status-codes"
import { AppError } from "./globalErrorHelper.js"
import { Role, UserStatus } from "../../generated/prisma/enums"

interface IUser {
    id:string,
    name: string,
    email: string,
    role: Role
    userStatus: UserStatus
}
export const userCheck=(user:IUser | null | undefined)=>{
    if(!user){
        throw new AppError("User not found", StatusCodes.NOT_FOUND)
    }
    if(user.userStatus === UserStatus.BANNED){
        throw new AppError("User is banned.", StatusCodes.FORBIDDEN)
    }
}