import { StatusCodes } from "http-status-codes";
import { PropertyRentRequestStatus, Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/globalErrorHelper.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateReviewPayload } from "./review_interfaces.js";

const createReviewServices = async (
  payload: ICreateReviewPayload
) => {
  const { tenantId, tenantRole, propertyId, content, rating } = payload;

  // 1. Role check
  if (tenantRole !== Role.TENANT) {
    throw new AppError(
      "Only tenants are allowed to create reviews.",
      StatusCodes.FORBIDDEN
    );
  }

  // 2. Check rental request exists & approved
  const rentalRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: PropertyRentRequestStatus.APPROVED,
    },
  });

  if (!rentalRequest) {
    throw new AppError(
      "You can only review properties you have successfully rented.",
      StatusCodes.BAD_REQUEST
    );
  }

  // 3. Check existing review (optional, DB already enforces)
  const existingReview = await prisma.review.findUnique({
    where: {
      uniqueTenantProperty: {
        tenantId,
        propertyId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      "You have already reviewed this property.",
      StatusCodes.BAD_REQUEST
    );
  };

  // 4. validating ratings
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
  throw new AppError(
    "Rating must be an integer between 1 and 5.",
    StatusCodes.BAD_REQUEST
  );
}

  // 5. Create review
  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId,
      content,
      rating,
    },
  });

  return review;
};
export const reviewServices={
    createReviewServices
}