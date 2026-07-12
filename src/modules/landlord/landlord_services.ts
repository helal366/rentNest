import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper.js";
import {
  IAdminUpdatePropertyPayload,
  IApproveRejectRentRequestPayload,
  ICreatePropertyPayload,
  ILandlordUpdatePropertyPayload,
} from "./landlord_interfaces.js";
import { prisma } from "../../lib/prisma.js";
import { validateAmenities } from "../../helperFunction/amenitiesValidityCheck.js";
import { validateLocation } from "../../helperFunction/locationValidityCheck.js";
import {
  PropertyLocation,
  PropertyRentRequestStatus,
  RentStatus,
  Role,
} from "#db-client";
import { Prisma } from "#db-client";

const creatPropertyServices = async (
  payload: ICreatePropertyPayload,
  userId: string,
) => {
  const { category, rentPrice, amenities, rentStatus, location, areaInSqFt } =
    payload;
  if (!category) {
    throw new AppError("Category is required", StatusCodes.BAD_REQUEST);
  }
  if (
    !rentPrice ||
    typeof rentPrice !== "number" ||
    rentPrice < 0 ||
    !Number.isInteger(rentPrice)
  ) {
    throw new AppError(
      "Rent price is required and must be a positive whole number.",
      StatusCodes.BAD_REQUEST,
    );
  }
  if (!amenities || !Array.isArray(amenities)) {
    //|| amenities.length === 0
    throw new AppError("Amenities must be an array.", StatusCodes.BAD_REQUEST);
  }

  validateAmenities(amenities);
  if (!location || location?.trim() === "") {
    return PropertyLocation.JATRABARI;
  }
  validateLocation(location);
  if (typeof areaInSqFt !== "number" || areaInSqFt <= 0) {
    throw new AppError(
      "Area must be a positive number.",
      StatusCodes.BAD_REQUEST,
    );
  }
  const createdProperty = await prisma.property.create({
    data: {
      rentPrice,
      rentStatus: rentStatus || "AVAILABLE",
      location: location || "JATRABARI",
      areaInSqFt: areaInSqFt || 1000,
      landlord: {
        connect: {
          id: userId,
        },
      },
      category: {
        connectOrCreate: {
          where: {
            name: category.toUpperCase(),
          },
          create: {
            name: category.toUpperCase(),
          },
        },
      },
      amenities: amenities,
    },
  });
  return createdProperty;
};

const updatePropertyServices = async (
  propertyId: string,
  userId: string,
  payload: ILandlordUpdatePropertyPayload | IAdminUpdatePropertyPayload,
  userRole: Role,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
    include: {
      propertyRentRequests: true,
    },
  });

  const landlordId = property.landlordId;
  if (userRole === Role.LANDLORD && userId !== landlordId) {
    throw new AppError(
      "Unauthorized access. Not your property.",
      StatusCodes.UNAUTHORIZED,
    );
  }
  const updateData: Prisma.PropertyUncheckedUpdateInput = {};
  if (userRole === Role.LANDLORD) {
    if ("isDeleted" in payload || "landlordId" in payload) {
      throw new AppError(
        "Property can not delete their property or change their ownership. Please contact with admin.",
        StatusCodes.UNAUTHORIZED,
      );
    }
  }
  const hasRentalRequest = property.propertyRentRequests.length > 0;
  const hasTenant = !!property.approvedTenantId;
  const notAvailable = property.rentStatus !== RentStatus.AVAILABLE;
  if ("category" in payload && payload.category) {
    if (hasRentalRequest || hasTenant || notAvailable) {
      throw new AppError(
        "Can not change category after rental activity.",
        StatusCodes.BAD_REQUEST,
      );
    }
    const category = await prisma.category.findUnique({
      where: {
        name: payload.category,
      },
    });
    if (!category) {
      throw new AppError("Category not found", StatusCodes.BAD_REQUEST);
    }
    updateData.propertyCategoryId = category.id;
  }
  if ("rentPrice" in payload && payload.rentPrice !== undefined) {
    if (
      typeof payload.rentPrice !== "number" ||
      payload.rentPrice < 0 ||
      !Number.isInteger(payload.rentPrice)
    ) {
      throw new AppError(
        "Rent price must be a positive whole number.",
        StatusCodes.BAD_REQUEST,
      );
    }
    updateData.rentPrice = payload.rentPrice;
  }
  if ("amenities" in payload && payload.amenities) {
    if (!Array.isArray(payload.amenities)) {
      throw new AppError(
        "Amenities must be an array.",
        StatusCodes.BAD_REQUEST,
      );
    }
    validateAmenities(payload.amenities);
    updateData.amenities = payload.amenities;
  }
  if ("location" in payload && payload.location) {
    validateLocation(payload.location);
    updateData.location = payload.location;
  }
  if ("areaInSqFt" in payload && payload.areaInSqFt) {
    if (typeof payload.areaInSqFt !== "number" || payload.areaInSqFt <= 0) {
      throw new AppError(
        "Area must be a positive number.",
        StatusCodes.BAD_REQUEST,
      );
    }
    updateData.areaInSqFt = payload.areaInSqFt;
  }
  if ("approvedTenantId" in payload) {
    if (payload.approvedTenantId) {
      const tenant = await prisma.user.findUniqueOrThrow({
        where: {
          id: payload.approvedTenantId,
        },
      });
      if (tenant.role !== Role.TENANT) {
        throw new AppError(
          "Assigned person is not a TENANT. Please let him register as TENANT first",
          StatusCodes.BAD_REQUEST,
        );
      }
      updateData.approvedTenantId = payload.approvedTenantId;
      updateData.rentStatus = RentStatus.RENTED;
    } else {
      updateData.approvedTenantId = null;
      updateData.rentStatus = RentStatus.AVAILABLE;
    }
  }
  if (
    "rentStatus" in payload &&
    payload.rentStatus !== undefined &&
    !("approvedTenantId" in payload)
  ) {
    const validStatuses = Object.values(RentStatus);
    if (!validStatuses.includes(payload.rentStatus)) {
      throw new AppError("Invalid rent status value.", StatusCodes.BAD_REQUEST);
    }
    updateData.rentStatus = payload.rentStatus;
  }
  if (userRole === Role.ADMIN) {
    if ("landlordId" in payload && payload.landlordId) {
      const landlord = await prisma.user.findUniqueOrThrow({
        where: {
          id: payload.landlordId,
        },
      });
      if (landlord.role !== Role.LANDLORD) {
        throw new AppError(
          "The proposed assigning person is not a LANDLORD",
          StatusCodes.BAD_REQUEST,
        );
      }
      updateData.landlordId = payload.landlordId;
    }
    if ("isDeleted" in payload) {
      if (payload.isDeleted) {
        updateData.deletedAt = new Date();
        updateData.isDeleted = true;
      } else {
        updateData.deletedAt = null;
        updateData.isDeleted = false;
      }
    }
  }

  const updatedProperty = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: updateData,
  });
  return { updatedProperty };
};

const deletePropertyServices = async (
  propertyId: string,
  userId: string,
  userRole: Role,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
    include: {
      propertyRentRequests: true,
      approvedTenant: true,
    },
  });
  if (userRole === Role.LANDLORD && property.landlordId !== userId) {
    throw new AppError(
      "Unauthorized. This is not your property.",
      StatusCodes.UNAUTHORIZED,
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    //  CHANGE 4: Delete dependent data FIRST
    // 1. Delete rental requests
    await tx.rentalRequest.deleteMany({
      where: { propertyId },
    });

    // 2. Delete reviews
    await tx.review.deleteMany({
      where: { propertyId },
    });

    // (Optional) If you had other relations → delete here

    //  CHANGE 5: Remove tenant link (because of FK constraint)
    await tx.property.update({
      where: { id: propertyId },
      data: {
        approvedTenantId: null,
      },
    });

    //  CHANGE 6: Finally delete property
    const deletedProperty = await tx.property.delete({
      where: { id: propertyId },
    });

    return deletedProperty;
  });
  return result;
};

const getRentalRequestsByLandlordServices = async (
  landlordId: string,
  landlordRole: Role,
) => {
  if (landlordRole !== Role.LANDLORD) {
    throw new AppError(
      "Access denied: Please login as LANDLORD",
      StatusCodes.FORBIDDEN,
    );
  }
  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      landlordId,
    },
    include: {
      rentalRequestProperty: {
        select: {
          id: true,
          rentPrice: true,
          location: true,
          rentStatus: true,
          areaInSqFt: true,
          amenities: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return { rentalRequests };
};

const approveOrRejectRentalRequestServices = async (
  payload: IApproveRejectRentRequestPayload,
) => {
  const { rentalRequestId, landlordId, landlordRole, requestStatus } = payload;
  
  if (landlordRole !== Role.LANDLORD) {
    throw new AppError(
      "Unauthorized Access. Please login as LANDLORD",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const requestStatusUpper = requestStatus.toUpperCase();
  const validRequestStatuses = ["PENDING", "APPROVED", "REJECTED"];
  
  if (!validRequestStatuses.includes(requestStatusUpper)) {
    throw new AppError(
      `Invalid request Status. Please send PENDING, APPROVED, or REJECTED.`,
      StatusCodes.BAD_REQUEST
    );
  }

  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: rentalRequestId },
  });

  if (rentalRequest.landlordId !== landlordId) {
    throw new AppError(
      "Unauthorized Access. Please send the property owner.",
      StatusCodes.FORBIDDEN,
    );
  }

  if (rentalRequest.requestStatus === requestStatusUpper) {
    throw new AppError(
      `Already updated to your desired status as ${requestStatusUpper}`,
      StatusCodes.CONFLICT
    );
  }

  const propertyId = rentalRequest.propertyId;

  // ==========================================
  // LOGIC FOR UPDATING STATUS TO PENDING
  // ==========================================
  if (requestStatusUpper === PropertyRentRequestStatus.PENDING) {
    
    // Scenario A: Request is currently APPROVED
    if (rentalRequest.requestStatus === PropertyRentRequestStatus.APPROVED) {
      if (rentalRequest.isPaid) {
        throw new AppError(
          "Cannot change status to PENDING. Payment has already been completed for this approval.",
          StatusCodes.BAD_REQUEST
        );
      }

      // If approved but unpaid, revert this request, restore others, and free up the property
      await prisma.$transaction(async (tx) => {
        await tx.rentalRequest.updateMany({
          where: { propertyId},
          data: { requestStatus: PropertyRentRequestStatus.PENDING },
        });

        await tx.property.update({
          where: { id: propertyId },
          data: {
            approvedTenantId: null,
            rentStatus: RentStatus.AVAILABLE,
          },
        });
      });

      return { message: "Rental request and all sister requests restored to PENDING successfully" };
    }

    // Scenario B: Request is currently REJECTED
    if (rentalRequest.requestStatus === PropertyRentRequestStatus.REJECTED) {
      // Find if there is ANY approved request for this property
      const approvedRequest = await prisma.rentalRequest.findFirst({
        where: {
          propertyId,
          requestStatus: PropertyRentRequestStatus.APPROVED,
        },
      });

      if (approvedRequest) {
        if (approvedRequest.isPaid) {
          throw new AppError(
            "Cannot revert to PENDING. Another tenant has already approved and paid for this property.",
            StatusCodes.BAD_REQUEST
          );
        }

        // If another request is approved but unpaid, reset the entire property ecosystem back to PENDING
        await prisma.$transaction(async (tx) => {
          await tx.rentalRequest.updateMany({
            where: { propertyId },
            data: { requestStatus: PropertyRentRequestStatus.PENDING },
          });

          await tx.property.update({
            where: { id: propertyId },
            data: {
              approvedTenantId: null,
              rentStatus: RentStatus.AVAILABLE,
            },
          });
        });

        return { message: "All property requests reset to PENDING because the prior approval was unpaid" };
      }

      // If no other request was approved, just move this standalone rejected request to pending
      await prisma.rentalRequest.update({
        where: { id: rentalRequestId },
        data: { requestStatus: PropertyRentRequestStatus.PENDING },
      });

      return { message: "Rental request status updated to PENDING successfully" };
    }
  }

  // ==========================================
  // LOGIC FOR UPDATING STATUS TO APPROVED
  // ==========================================
  if (requestStatusUpper === PropertyRentRequestStatus.APPROVED) {
     const existingPaidRequest = await prisma.rentalRequest.findFirst({
      where: {
        propertyId,
        requestStatus: PropertyRentRequestStatus.APPROVED,
      },
    });
    if(existingPaidRequest){

      if (existingPaidRequest?.isPaid) {
        throw new AppError(
          "Cannot approve this request. This property has already been leased out and paid for by another tenant.",
          StatusCodes.CONFLICT
        );
      }
    }
    await prisma.$transaction(async (tx) => {
      await tx.rentalRequest.update({
        where: { id: rentalRequestId },
        data: { requestStatus: PropertyRentRequestStatus.APPROVED },
      });
  
      await tx.rentalRequest.updateMany({
        where: {
          propertyId,
          NOT: { id: rentalRequestId },
        },
        data: { requestStatus: PropertyRentRequestStatus.REJECTED },
      });
  
      await tx.property.update({
        where: { id: propertyId },
        data: {
          approvedTenantId: rentalRequest.tenantId,
          rentStatus: RentStatus.RENTED,
        },
      });
    });

    return { message: "Rental request approved and others rejected successfully" };
  }

  // ==========================================
  // LOGIC FOR UPDATING STATUS TO REJECTED
  // ==========================================
  if (requestStatusUpper === PropertyRentRequestStatus.REJECTED) {
     // Scenario 1: Present status is APPROVED and isPaid is true -> NO UPDATE
    if (rentalRequest.requestStatus === PropertyRentRequestStatus.APPROVED && rentalRequest.isPaid) {
      throw new AppError(
        "Cannot reject this request. The tenant has already completed the payment process for this approved lease.",
        StatusCodes.BAD_REQUEST
      );
    }

    await prisma.$transaction(async (tx) => {
    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { requestStatus: PropertyRentRequestStatus.REJECTED },
    });
     await tx.property.update({
          where: { id: propertyId },
          data: {
            approvedTenantId: null,
            rentStatus: RentStatus.AVAILABLE,
          },
        });
  });
  }
   return { message: "Rental request rejected and property availability restored successfully." };
};

export const landlordServices = {
  creatPropertyServices,
  updatePropertyServices,
  deletePropertyServices,
  getRentalRequestsByLandlordServices,
  approveOrRejectRentalRequestServices,
};
