import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { Prisma, Role} from "#db-client";
import { sslCommerzInit } from "../../utils/sslcommerz/sslcommerz_init.js";
import { findData } from "../../utils/sslcommerz/findData.js";
import { createPaymentCheckValidity } from "../../utils/sslcommerz/createPaymentCheckValidity.js";
import { validateSslPayment } from "../../utils/sslcommerz/ssl_commerz_ipn_validation.js";
import { IConfirmPaymentPayload } from "./payment_interfaces.js";
import { v4 as uuidv4 } from "uuid";

const createPaymentServices = async (
  tenantId:string,
  rentalRequestId: string,
) => {
  await createPaymentCheckValidity(tenantId, rentalRequestId)
  
  const {apiResponse, transactionId} =await sslCommerzInit(rentalRequestId)
  if (apiResponse?.status === "SUCCESS" && apiResponse?.sessionkey) {

    return {...apiResponse,tran_id: transactionId};
  } else {
    throw new AppError(
      apiResponse?.failedreason || "Failed to initiate gateway session", 
      StatusCodes.BAD_GATEWAY
    );
  }
};

const confirmPaymentServices = async (payload: IConfirmPaymentPayload) => {
  // console.log({payload})

  const {
    tran_id,
    val_id,
    risk_title,
    card_type,
    amount,
    value_a,
    value_b,
    value_c,
    sessionkey,
  } = payload;

  if (!tran_id) {
    throw new AppError(
      "Transaction ID missing in webhook payload",
      StatusCodes.BAD_REQUEST,
    );
  }

  // --- START OF IPN VALIDATION ---
  // Call the official SSLCommerz validation endpoint
  const verifiedData = await validateSslPayment(val_id);
  // console.log({ verifiedData });
  // Parse card types to match your explicit PaymentMethod Enum
  const cardTypeLower = card_type?.toLowerCase() || "";
  let cleanMethod: "CARD" | "WALLET" | "BANK_TRANSFER" = "CARD";

  if (
    cardTypeLower.includes("bkash") ||
    cardTypeLower.includes("nagad") ||
    cardTypeLower.includes("rocket")
  ) {
    cleanMethod = "WALLET";
  } else if (cardTypeLower.includes("bank")) {
    cleanMethod = "BANK_TRANSFER";
  } else {
    cleanMethod = "WALLET";
  }

  if (verifiedData.status !== "VALID" && verifiedData.status !== "VALIDATED") {
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
        method: cleanMethod,
      },
    });
  }
  // if (verifiedData.status !== "VALID" && verifiedData.status !== "VALIDATED") {
  //   throw new AppError(
  //     "Payment validation failed at SSLCommerz",
  //     StatusCodes.PAYMENT_REQUIRED,
  //   );
  // }

  // Fetch the actual rental and property data from your system database
  const { property } = await findData(value_a); // value_a contains rentalRequestId

  // CRITICAL: Double check that the user didn't temper with the pricing parameters
  if (Number(verifiedData.amount) !== Number(property.rentPrice)) {
    throw new AppError(
      "Payment amount mismatch anomaly detected",
      StatusCodes.BAD_REQUEST,
    );
  }
  // --- END OF IPN VALIDATION ---

  /// If payment is successful
  const sslSessionIdUnique = `SESSION_COMPLETED-${uuidv4().substring(0, 8).toUpperCase()}`;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the Payment row for the first time
    const newPayment = await tx.payment.create({
      data: {
        transactionId: tran_id,
        rentalRequestId: value_a, // Extracted from custom value_a parameter
        tenantId: value_b, // Extracted from custom value_b parameter
        landlordId: value_c, // Extracted from custom value_c parameter
        amount: Number(amount),
        paymentStatus: "COMPLETED",
        sslSessionId: payload.sessionkey || sslSessionIdUnique,
        sslValidationId: val_id,
        sslRiskTitle: risk_title,
        sslCardType: card_type,
        method: cleanMethod,
        paidAt: new Date(),
      },
    });

    // 2. Mark the corresponding rental request as paid
    await tx.rentalRequest.update({
      where: { id: value_a },
      data: { isPaid: true },
    });

    return newPayment;
  });

};;


// Retrieve payment history filtered by user authority
const getPaymentHistoryServices = async (userId: string, role: Role) => {
  // 1. Build a type-safe dynamic filter condition
  const whereClause: Prisma.PaymentWhereInput = {};
  
  if (role === Role.LANDLORD) {
    whereClause.landlordId = userId;
  } else if (role === Role.TENANT) {
    whereClause.tenantId = userId;
  }
  // If role is Role.ADMIN, whereClause remains empty {} to fetch all payments

  // 2. Execute the single, streamlined database query
  return await prisma.payment.findMany({
    where: whereClause,
    include: {
      rentalRequest: {
        select: {
          isPaid: true,
          rentalRequestProperty: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
              rentPrice: true,
              location: true,
            },
          },
        },
      },
      tenant: {
        select: {
          name: true,
          email: true,
        },
      },
      landlord: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { 
      paidAt: "desc" 
    },
  });
};


// Find individual payment transaction context
const getPaymentDetailsByIdServices = async (paymentId: string, userId: string, role: Role) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      rentalRequest: {
        select: {
          isPaid: true,
          requestStatus: true,
          rentalRequestProperty: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
              rentPrice: true,
              location: true,
              amenities: true,
              areaInSqFt: true,
              rentStatus: true,
            },
          },
        },
      },
      tenant: {
        select: {
          name: true,
          email: true,
          role: true,
          address: true,
          contactNo: true,
        },
      },
      landlord: {
        select: {
          name: true,
          email: true,
          role: true,
          address: true,
          contactNo: true,
        },
      },
    },
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
