import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper";
import { landlordServices } from "./landlord_services";
import { ICreatePropertyPayload } from "./landlord_interfaces";

const creatPropertyController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const payload = req.body as ICreatePropertyPayload;
    const userId = req.user?.id;
    if(!userId){
        throw new AppError("Please login", StatusCodes.BAD_REQUEST);
    }
    const result = await landlordServices.creatPropertyServices(payload, userId)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Property created successfully.",
        data: result
    })
});
const updatePropertyController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const propertyId = req.params.id;
    if(!propertyId){
        throw new AppError("Property id is required.",StatusCodes.BAD_REQUEST)
    }
    if(!req.user){
        throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    };
    const userId= req.user?.id;
    const userRole = req.user?.role;
    const payload = req.body;
    const result = await landlordServices.updatePropertyServices(propertyId as string, userId, payload, userRole)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Update successful",
        data: result
    })
});
const deletePropertyController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const propertyId = req.params.id;
    if(!propertyId){
        throw new AppError("Property id is required.",StatusCodes.BAD_REQUEST)
    }
    if(!req.user){
        throw new AppError("Please login", StatusCodes.BAD_REQUEST);
    };
    const userId= req.user?.id;
    const userRole = req.user?.role;
    const result = await landlordServices.deletePropertyServices(propertyId as string, userId, userRole);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Property deleted successfully.",
        data: result
    })
});
const getRentalRequestsByLandlordController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    if(!req.user){
         throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    };
    const landlordId = req.user.id;
    const landlordRole = req.user.role;
    const result = await landlordServices.getRentalRequestsByLandlordServices(landlordId, landlordRole)
    sendResponse(res, {
        success:true,
        statusCode: StatusCodes.OK,
        message: "Landlord rental requests retrieved successfully.",
        data: result
    })
})
export const landlordControllers = {
    creatPropertyController,
    updatePropertyController,
    deletePropertyController,
    getRentalRequestsByLandlordController
}