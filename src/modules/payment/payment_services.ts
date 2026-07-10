import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { Role} from "#db-client";
import { sslCommerzInit } from "../../utils/sslcommerz/sslcommerz_init.js";
import { findData } from "../../utils/sslcommerz/findData.js";
import { createPaymentCheckValidity } from "../../utils/sslcommerz/createPaymentCheckValidity.js";

const createPaymentServices = async (
  tenantId:string,
  rentalRequestId: string,
) => {
  await createPaymentCheckValidity(tenantId, rentalRequestId)
  const {rentalRequest, property}= await findData(rentalRequestId)

  // sslcommerz init
  
  const {apiResponse, transactionId} =await sslCommerzInit(rentalRequestId)
  if (apiResponse?.status === "SUCCESS" && apiResponse?.sessionkey) {
    
    // await prisma.payment.create({
    //   data: {
    //     transactionId: transactionId,
    //     rentalRequestId: rentalRequestId,
    //     tenantId: tenantId,
    //     landlordId: rentalRequest.landlordId, 
    //     amount: property.rentPrice,
    //     paymentStatus: "PENDING",
    //     sslSessionId: apiResponse.sessionkey,  
    //     provider: "SSLCOMMERZ",
    //     method: "CARD"
    //   }
    // });

    return {...apiResponse,tran_id: transactionId};
  } else {
    throw new AppError(
      apiResponse?.failedreason || "Failed to initiate gateway session", 
      StatusCodes.BAD_GATEWAY
    );
  }
};

const confirmPaymentServices = async (paymentPayload: any) => {
  const { tran_id, status } = paymentPayload;

  if (!tran_id) {
    throw new AppError("Transaction ID missing in webhook payload", StatusCodes.BAD_REQUEST);
  }

  // Find the pending payment transaction in your database
  const paymentRecord = await prisma.payment.findUnique({
    where: { transactionId: tran_id },
  });

  if (!paymentRecord) {
    throw new AppError("Transaction record not found", StatusCodes.NOT_FOUND);
  }

  // Check if incoming gateway status is verified success
  if (status === "VALID" || status === "VALIDATED") {
    return await prisma.payment.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: "COMPLETED" }, // Maps to your database Payment Status schema
    });
  }

  // Handle alternative failure scenarios
  await prisma.payment.update({
    where: { transactionId: tran_id },
    data: { paymentStatus: "FAILED" },
  });

  throw new AppError(`Payment failed with status: ${status}`, StatusCodes.PAYMENT_REQUIRED);
};


// Retrieve payment history filtered by user authority
const getPaymentHistoryServices = async (userId: string, role: string) => {
  if (role === "ADMIN") {
    return await prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
    });
  }
  if(role===Role.LANDLORD){
    return await prisma.payment.findMany({
      where: { landlordId: userId },
      orderBy: { paidAt: "desc" },
    });
  }
  return await prisma.payment.findMany({
      where: { tenantId: userId },
      orderBy: { paidAt: "desc" },
    });
};

// Find individual payment transaction context
const getPaymentDetailsByIdServices = async (paymentId: string, userId: string, role: Role) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { rentalRequest: true },
  });

  // Basic authorization wall check
  if(role === Role.LANDLORD && payment.landlordId !== userId){
    throw new AppError("Access denied to view this receipt record. You are not the owner of this property.", StatusCodes.FORBIDDEN);
  }
  if (role === Role.TENANT && payment.tenantId !== userId) {
    throw new AppError("Access denied to view this receipt record. You are not the approved tenant of this property", StatusCodes.FORBIDDEN);
  }

  return payment;
};
export const paymentServices = {
  createPaymentServices,
  confirmPaymentServices,
  getPaymentHistoryServices,
  getPaymentDetailsByIdServices
};
