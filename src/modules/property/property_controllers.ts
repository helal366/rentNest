import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { propertyServices } from "./property_services.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper.js";
import { PropertyLocation } from "../../../generated/prisma/enums";

const getAllPropertiesController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const filters = {
        location: req.query.location? req.query.location as PropertyLocation: undefined,
        minPrice: req.query.minPrice? Number(req.query.minPrice): undefined,
        maxPrice: req.query.maxPrice? Number(req.query.maxPrice): undefined,
        category: req.query.category? req.query.category as string: undefined
    }
     const result = await propertyServices.getAllPropertiesServices(filters);
    sendResponse(res, {
        success:true,
        statusCode: StatusCodes.OK,
        message: "Properties retrieved successfully.",
        data: result
    })
});
const getPropertyByIdController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
   const propertyId = req.params.id;
   if(!propertyId){
    throw new AppError("Property id is required.", StatusCodes.BAD_REQUEST)
   }
   const result = await propertyServices.getPropertyByIdServices(propertyId as string);
   sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Property retrieved successfully.",
    data: result
   })
});
export const propertyControllers = {
    getAllPropertiesController,
    getPropertyByIdController
}