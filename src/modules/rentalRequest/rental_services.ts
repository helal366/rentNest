import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { ICreateRentalRequestPayload, IGetRentalRequestByIdPayload } from "./rental_interfaces.js";
import { Role } from "#db-client"; 
import { authGetRentalRequestsByUser } from "../../helperFunction/authGetRentalRequestsByUser.js";
import { isPaidRentalrequests } from "../../helperFunction/isPaidRentalrequests.js";

const createRentalRequestServices = async (
  payload: ICreateRentalRequestPayload,
) => {
  const { tenantId, tenantRole, propertyId, landlordId } = payload;
  if (tenantRole !== Role.TENANT) {
    throw new Error("Please login as TENANT.");
  }
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });
  if (landlordId !== property.landlordId) {
    throw new AppError(
      "Property ownership mismatch: The selected property does not belong to the specified landlord.",
      StatusCodes.BAD_REQUEST,
    );
  }
  const existingRequest = await prisma.rentalRequest.findUnique({
    where: {
      uniqueTenantPropertyRequest: {
        tenantId,
        propertyId,
      },
    },
  });
  if (existingRequest) {
    throw new AppError(
      "You have already submitted a rental request for this property.",
      StatusCodes.BAD_REQUEST,
    );
  };
  if(property.rentStatus==="RENTED"){
    throw new AppError("This is property is not available to rent.", StatusCodes.BAD_REQUEST)
  }
  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      landlordId,
      propertyId,
      tenantId,
    },
  });
  return rentalRequest;
};

const getRentalRequestsByTenantOrLandlordServices = async (
  userId: string,
  userRole: Role,
) => {
  if (
    userRole !== Role.TENANT &&
    userRole !== Role.LANDLORD
  ) {
    throw new AppError(
      "Please login",
      StatusCodes.FORBIDDEN,
    );
  }

  const rentalRequests=await authGetRentalRequestsByUser(userId, userRole)

   return rentalRequests
};

const getRentalRequestByIdServices = async (
  payload: IGetRentalRequestByIdPayload,
) => {
  const { rentalRequestId, userId, userRole } = payload;
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalRequestId,
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
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          contactNo: true,
          userStatus: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          contactNo: true,
          userStatus: true,
        },
      },
      payments: {
        select: {
          amount: true,
          paidAt: true,
          method: true,
          paymentStatus: true,
          provider: true,
        },
      },
    },
  });

  if (!rentalRequest) {
    throw new AppError(
      "Rental request record not found.",
      StatusCodes.NOT_FOUND,
    );
  }
  if (userRole === Role.TENANT) {
    if (userId !== rentalRequest.tenantId) {
      throw new AppError(
        "Access Denied: Tenant is not the submitter of this rental request.",
        StatusCodes.FORBIDDEN,
      );
    }
  }
  if (userRole === Role.LANDLORD) {
    if (userId !== rentalRequest.landlordId) {
      throw new AppError(
        "Access Denied: Landlord is not the owner of the property for which this rental request created",
        StatusCodes.FORBIDDEN,
      );
    }
  }
  return { rentalRequest };
};

const getRentalRequestIsPaidServiceLayer = async (userId:string) => {
  const isPaidRentalRequests = await isPaidRentalrequests(userId);
  return isPaidRentalRequests
};

export const rentalRequestServices = {
  createRentalRequestServices,
  getRentalRequestsByTenantOrLandlordServices,
  getRentalRequestByIdServices,
  getRentalRequestIsPaidServiceLayer,
};
