import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../globalErrorHelper.js";

export const createPaymentCheckValidity = async (
  tenantId: string,
  rentalRequestId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: rentalRequestId,
    },
  });
  if (rentalRequest.requestStatus !== "APPROVED") {
    throw new AppError(
      `This rent request is not APPROVED. Request status is: ${rentalRequest.requestStatus}`,
      StatusCodes.FORBIDDEN,
    );
  }
  if (rentalRequest.isPaid) {
    throw new AppError(
      "This rental request has already been successfully paid.",
      StatusCodes.BAD_REQUEST,
    );
  }
  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      "You did not applied this rent request for this property.",
      StatusCodes.CONFLICT,
    );
  }
  
};
