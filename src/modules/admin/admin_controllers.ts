import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminServices } from "./admin_services";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

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
})
export const adminControllers={
    getAllUsersController,
    getAllPropertiesController
}