import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { StatusCodes } from "http-status-codes";
import { reviewServices } from "./review_services.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { userCheck } from "../../utils/userCheck.js";

const createReviewController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if(!req.user){
        throw new AppError("Please login", StatusCodes.UNAUTHORIZED)
    }
    userCheck(req.user)
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
export const reviewControllers = {
  createReviewController,
};
