import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authServices } from "./auth_services";
import { setAuthTokensInCookies } from "../../utils/setAuthTokensInCookies";
import { AppError } from "../../utils/globalErrorHelper";

const authRegisterController = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    const result = await authServices.authRegisterServices(payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User registered successfully.",
        data: result
    })
});
const authLoginController = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    const result = await authServices.authLoginServices(payload);

    setAuthTokensInCookies(res, result)
    sendResponse(res, {
        success:true,
        statusCode: StatusCodes.OK,
        message: "Login successful.",
        data: result
    })
});
const getAuthMeController = catchAsync(async(req:Request, res:Response)=>{
    const userId = req.user?.id;
    if(!userId){
        throw new AppError("Please login", StatusCodes.BAD_REQUEST)
    }
    const result = await authServices.getAuthMeServices(userId)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "here is my user data",
        data: result
    })
})
export const authControllers ={
    authRegisterController,
    authLoginController,
    getAuthMeController
}