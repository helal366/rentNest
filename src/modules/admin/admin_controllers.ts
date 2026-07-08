import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminServices } from "./admin_services";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper";

const getAllUsersController=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await adminServices.getAllUsersServices();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All users retrieved successfully.",
        data: result
    })
});

const getAllPropertiesController=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await adminServices.getAllPropertiesServices();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All properties retrieved successfully.",
        data: result
    })
});

const getAllRentalRequestsController=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await adminServices.getAllRentalRequestsServices();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All rental requests retrieved successfully.",
        data: result
    })
});

const updateUserBanUnbanController=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const userId=req.params.id;
    if(!userId || typeof userId !== "string"){
        throw new AppError("User id is required as string.", StatusCodes.BAD_REQUEST)
    };
    const {userStatus} = req.body;
    if(!userStatus){
        throw new AppError("User status is required.", StatusCodes.BAD_REQUEST)
    }
    const result = await adminServices.updateUserBanUnbanServices(userId, userStatus);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All rental requests retrieved successfully.",
        data: result
    })
})
export const adminControllers={
    getAllUsersController,
    getAllPropertiesController,
    getAllRentalRequestsController,
    updateUserBanUnbanController
}