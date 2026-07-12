import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateReviewPayload } from "./review_interfaces.js";
import { PropertyRentRequestStatus, Role } from "#db-client"; 

const createReviewServices = async (payload: ICreateReviewPayload) => {
  const { tenantId, tenantRole, propertyId, content, rating } = payload;

  // 1. Role check
  if (tenantRole !== Role.TENANT) {
    throw new AppError(
      "Only tenants are allowed to create reviews.",
      StatusCodes.FORBIDDEN,
    );
  }

  // 2. Check rental request exists & approved
  const rentalRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      // status: PropertyRentRequestStatus.APPROVED,
    },
  });

  if (!rentalRequest) {
    throw new AppError(
      "Rental request not found.",
      StatusCodes.BAD_REQUEST,
    );
  }
  if(rentalRequest.requestStatus !== "APPROVED"){
    throw new AppError(
      "You can only review properties after the landlord approval and successful payment.",
      StatusCodes.BAD_REQUEST,
    );
  }
  if(rentalRequest.requestStatus === "APPROVED" && !rentalRequest.isPaid){
    throw new AppError(
      "You can only review properties after the landlord approval and successful payment.",
      StatusCodes.BAD_REQUEST,
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
      StatusCodes.BAD_REQUEST,
    );
  }

  // 4. validating ratings
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(
      "Rating must be an integer between 1 and 5.",
      StatusCodes.BAD_REQUEST,
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
const deleteReviewServices = async (reviewId: string) => {
  console.log("Attempting to delete review with ID:", reviewId);

  const result = await prisma.review.deleteMany({
    where: {
      id: reviewId // Make sure this exactly matches your DB string type
    }
  });

  console.log("Prisma delete result count:", result.count);

  if (result.count === 0) {
    // This stops the controller from sending a fake success message to Postman
    throw new AppError(`No review found with ID ${reviewId}. Database unchanged.`, StatusCodes.NOT_FOUND);
  }
}

export const reviewServices = {
  createReviewServices,
  deleteReviewServices
};
