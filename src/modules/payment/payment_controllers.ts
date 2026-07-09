import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { paymentServices } from "./payment_services.js";

const createPaymentController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const result = await paymentServices.createPaymentServices()
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Payment created successfully.",
        data: result
    })
});
export const paymentControllers={
    createPaymentController
}