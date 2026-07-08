import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const createReviewController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{

});
export const reviewControllers={
    createReviewController
}