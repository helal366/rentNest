import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { paymentServices } from "./payment_services.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { frontendURL } from "../../helperFunction/frontendBackendUrl.js";

const createPaymentController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  
    if(!req.user){
        throw new AppError("Please login.", StatusCodes.UNAUTHORIZED)
    }
    const tenantId = req.user.id;
    const {rentalRequestId} = req.body;
    if(!rentalRequestId){
        throw new AppError("Rental Request Id required", StatusCodes.BAD_REQUEST)
    }
    const result = await paymentServices.createPaymentServices(tenantId, rentalRequestId)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Payment gateway link generated successfully.",
        data: {
            paymentUrl: result.GatewayPageURL, // Raw URL for browser pasting
            transactionId: result.tran_id,
            sslSessionId: result.sessionkey
        }
    });
});


const confirmPaymentController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. SSLCommerz sends transactional status maps inside req.body
    // console.log("payload from confirm payment controller: ", req.body);

    // 2. Process validation, save database metrics via Prisma transaction, and extract return values
    const result= await paymentServices.confirmPaymentServices(req.body);
    const rentalId = result.rentalRequestId;
    const paymentId = result.id;
    const frontendUI = frontendURL;  //frontend url

    // 3. Evaluate the payment status map to issue browser redirections
    if (req.body.status === "VALID" || req.body.status === "VALIDATED") {
      return res.redirect(
        `${frontendUI}/payment_confirmation?status=success&paymentId=${paymentId}&rentalId=${rentalId}&tranId=${req.body.tran_id}&amount=${req.body.amount}&method=${req.body.card_type}&date=${new Date().toISOString()}`,
      );
    } else if (req.body.status === "CANCELLED") {
      return res.redirect(
        `${frontendUI}/payment_confirmation?status=cancelled`,
      );
    } else {
      return res.redirect(`${frontendUI}/payment_confirmation?status=failed`);
    }
  },
);


const getPaymentHistoryController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    if (!req.user) throw new AppError("Please login.", StatusCodes.UNAUTHORIZED);

  const result = await paymentServices.getPaymentHistoryServices(req.user.id, req.user.role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment history fetched successfully.",
    data: result,
  });
});

const getPaymentHistorByIdyController=catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
     if (!req.user) throw new AppError("Please login.", StatusCodes.UNAUTHORIZED);

  const PaymentId  = req.params?.id;
  if(!PaymentId){
    throw new AppError("Payment id is required.",StatusCodes.BAD_REQUEST)
  }
  const result = await paymentServices.getPaymentDetailsByIdServices(PaymentId as string, req.user.id, req.user.role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Payment tracking record retrieved.",
    data: result,
  });
});

export const paymentControllers={
    createPaymentController,
    confirmPaymentController,
    getPaymentHistoryController,
    getPaymentHistorByIdyController
}