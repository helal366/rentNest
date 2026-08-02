import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { authServices } from "./auth_services.js";
import { setAuthTokensInCookies } from "../../utils/setAuthTokensInCookies.js";
import { AppError } from "../../utils/globalErrorHelper.js";

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
    console.log({payload})
    const result = await authServices.authLoginServices(payload);

    setAuthTokensInCookies(res, result);
    const { accessToken, refreshToken } = result
    sendResponse(res, {
        success:true,
        statusCode: StatusCodes.OK,
        message: "Login successful.",
        data: { accessToken, refreshToken }
    })
});
const getAuthMeController = catchAsync(async(req:Request, res:Response)=>{
    const userId = req.user?.id;
    if(!userId){
        throw new AppError("Please login", StatusCodes.BAD_REQUEST)
    }
    const result = await authServices.getAuthMeServices(userId);
     console.log("🔥 from backend /me profile fetch:", result);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Here is my details.",
        data: result
    })
});
const refreshTokenController=catchAsync(async(req:Request, res:Response,next:NextFunction)=>{
    const refreshToken = req.cookies.refreshToken;
    const result = await authServices.refreshTokenServices(refreshToken);
  
    setAuthTokensInCookies(res, result)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Token refreshed successfully.",
        data: result
    })
})
export const authControllers ={
    authRegisterController,
    authLoginController,
    getAuthMeController,
    refreshTokenController
}