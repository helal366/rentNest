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

const confirmPaymentServices = async (payload: any) => {
  const { tran_id, status, val_id, risk_title, card_type, amount, value_a, value_b, value_c } = payload;

  if (!tran_id) {
    throw new AppError("Transaction ID missing in webhook payload", StatusCodes.BAD_REQUEST);
  }

  // Parse card types to match your explicit PaymentMethod Enum
  const cardTypeLower = card_type?.toLowerCase() || "";
  let cleanMethod: "CARD" | "WALLET" | "BANK_TRANSFER" = "CARD";
  
  if (cardTypeLower.includes("bkash") || cardTypeLower.includes("nagad") || cardTypeLower.includes("rocket")) {
    cleanMethod = "WALLET";
  } else if (cardTypeLower.includes("bank")) {
    cleanMethod = "BANK_TRANSFER";
  }

  /// If payment is successful
  if (status === "VALID" || status === "VALIDATED") {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Create the Payment row for the first time
      const newPayment = await tx.payment.create({
        data: {
          transactionId: tran_id,
          rentalRequestId: value_a, // Extracted from custom value_a parameter
          tenantId: value_b,        // Extracted from custom value_b parameter
          landlordId: value_c,      // Extracted from custom value_c parameter
          amount: Number(amount),
          paymentStatus: "COMPLETED",
          sslSessionId: payload.sessionkey || "SESSION_COMPLETED",
          sslValidationId: val_id,
          sslRiskTitle: risk_title,
          sslCardType: card_type,
          method: cleanMethod,
          paidAt: new Date()
        }
      });

      // 2. Mark the corresponding rental request as paid
      await tx.rentalRequest.update({
        where: { id: value_a },
        data: { isPaid: true }
      });

      return newPayment;
    });
  }

  // If payment fails, log it as a failed record
  return await prisma.payment.create({
    data: {
      transactionId: tran_id,
      rentalRequestId: value_a,
      tenantId: value_b,
      landlordId: value_c,
      amount: Number(amount) || 0,
      paymentStatus: "FAILED",
      sslSessionId: payload.sessionkey || "SESSION_FAILED",
      provider: "SSLCOMMERZ",
      method: cleanMethod
    }
  });
  
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
