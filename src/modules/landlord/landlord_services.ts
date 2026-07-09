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
import {
  PropertyLocation,
  PropertyRentRequestStatus,
  RentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { validateLocation } from "../../helperFunction/locationValidityCheck.js";
import { Prisma } from "../../../generated/prisma/client.js";

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
  const { rentalRequestId, landlordId, landlordRole } = payload;
  if(landlordRole !== Role.LANDLORD){
    throw new AppError("Unauthorized Access. Please login as LANDLORD", StatusCodes.UNAUTHORIZED)
  }
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: rentalRequestId,
    }
  });
  if (rentalRequest.landlordId !== landlordId) {
    throw new AppError(
      "You are not authorized for this request. Please send the property owner.",
      StatusCodes.FORBIDDEN,
    );
  }
  const propertyId = rentalRequest.propertyId;
  await prisma.$transaction(async (tx) => {
    await tx.rentalRequest.update({
      where: {
        id: rentalRequestId,
      },
      data: {
        requestStatus: PropertyRentRequestStatus.APPROVED,
      },
    });

    await tx.rentalRequest.updateMany({
      where: {
        propertyId,
        NOT: {
          id: rentalRequestId,
        },
      },
      data: {
        requestStatus: PropertyRentRequestStatus.REJECTED,
      },
    });

    await tx.property.update({
      where:{id:propertyId},
      data:{
        approvedTenantId: rentalRequest.tenantId,
        rentStatus: RentStatus.RENTED
      }
    })

  });

  return {
    message: "Rental request approved and others rejected successfully",
  };
};
export const landlordServices = {
  creatPropertyServices,
  updatePropertyServices,
  deletePropertyServices,
  getRentalRequestsByLandlordServices,
  approveOrRejectRentalRequestServices,
};
