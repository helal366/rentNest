import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/globalErrorHelper";
import { StatusCodes } from "http-status-codes";
import { rentalRequestServices } from "./rental_services";
import { sendResponse } from "../../utils/sendResponse";

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
export const rentalRequestControllers= {
    createRentalRequestController
}