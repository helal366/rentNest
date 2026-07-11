import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { StatusCodes } from "http-status-codes";
import { rentalRequestServices } from "./rental_services.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { Role } from "#db-client";

const createRentalRequestController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const {propertyId, landlordId} = req.body;
    if(!propertyId || !landlordId){
        throw new AppError("Property id and landlord id are required.", StatusCodes.BAD_REQUEST)
    }
    if(!req.user){
        throw new AppError("Please login",StatusCodes.BAD_REQUEST)
    };
    const tenantId = req.user?.id;
    const tenantRole = req.user?.role;
    const payload = {tenantId, tenantRole, propertyId, landlordId}
    const result = await rentalRequestServices.createRentalRequestServices(payload);
    sendResponse(res,{
        success:true,
        statusCode: StatusCodes.CREATED,
        message: "Rental request created successfully.",
        data: result
    })
});
const getRentalRequestsByTenantOrLandlordController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    if(!req.user){
        throw new AppError("Please login",StatusCodes.UNAUTHORIZED)
    };
    const userId = req.user.id;
    const userRole = req.user.role;
    const result =await rentalRequestServices.getRentalRequestsByTenantOrLandlordServices(userId,userRole);
    const message = req.user.role === Role.TENANT 
  ? "Tenant rental requests retrieved successfully." 
  : "Landlord rental requests retrieved successfully.";
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message,
        data: result
    })
});
const getRentalRequestByIdController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const rentalRequestId = req.params.id;
    if(!rentalRequestId || typeof rentalRequestId !=="string"){
        throw new AppError("Rental request id is required as string.",StatusCodes.BAD_REQUEST)
    };

    if(!req.user){
        throw new AppError("Please login.",StatusCodes.UNAUTHORIZED)
    };
    const payload = {
        rentalRequestId ,
        userId: req.user.id,
        userRole: req.user.role
    }
    const result =await rentalRequestServices.getRentalRequestByIdServices(payload)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        data: result
    })
})
export const rentalRequestControllers= {
    createRentalRequestController,
    getRentalRequestsByTenantOrLandlordController,
    getRentalRequestByIdController
}