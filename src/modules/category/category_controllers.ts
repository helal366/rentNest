import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryServices } from "./category_services";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

const getAllCategoriesController=catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await categoryServices.getAllCategoriesServices();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All categories are retrieved successfully.",
        data: result
    })
});
export const categoryControllers={
    getAllCategoriesController
}