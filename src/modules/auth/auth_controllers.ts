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
});
const refreshTokenController=catchAsync(async(req:Request, res:Response,next:NextFunction)=>{
    const refreshToken = req.cookies.refreshToken;
    const result = await authServices.refreshTokenServices(refreshToken);
    // res.cookie("accessToken",accessToken,{
    //     httpOnly:true,
    //     secure:false,
    //     sameSite:"none",
    //     maxAge:1000*60*60*24*1 
    // });
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