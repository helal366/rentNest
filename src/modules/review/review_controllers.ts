import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { StatusCodes } from "http-status-codes";
import { reviewServices } from "./review_services.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createReviewController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if(!req.user){
        throw new AppError("Please login", StatusCodes.UNAUTHORIZED)
    }
    const payload = {
      tenantId: req.user.id,
      tenantRole: req.user.role,
      propertyId: req.body.propertyId,
      content: req.body.content,
      rating: req.body.rating,
    };
    const result = await reviewServices.createReviewServices(payload);

       sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Review created successfully.",
            data: result
        })
  }
);

const deleteReviewcontroller= catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  const reviewId = req.params.id;
  if(!reviewId){
    throw new AppError(`Review id is required.`,StatusCodes.NOT_FOUND)
  };
  await reviewServices.deleteReviewServices(reviewId as string)
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Review deleted successfully.",
    data: reviewId
  })
});
export const reviewControllers = {
  createReviewController,
  deleteReviewcontroller
};
