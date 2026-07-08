import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const createRentalRequestController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{

});
export const rentalRequestControllers= {
    createRentalRequestController
}