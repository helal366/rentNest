import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { ICreateRentalRequestPayload, IGetRentalRequestByIdPayload } from "./rental_interfaces.js";
import { Role } from "#db-client"; 
import { authGetRentalRequestsByUser } from "../../helperFunction/authGetRentalRequestsByUser.js";

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
  if (userRole !== Role.TENANT && userRole !== Role.LANDLORD) {
    throw new AppError("Please login as TENANT or LANDLORD", StatusCodes.FORBIDDEN);
  }
  // let rentalRequests:any;
  // if(userRole===Role.TENANT){
  //    rentalRequests = await prisma.rentalRequest.findMany({
  //     where: { tenantId:userId },
  //     include: {
  //       rentalRequestProperty: {
  //         select: {
  //           id: true,
  //           rentStatus: true,
  //           approvedTenant: {
  //             select: {
  //               name: true,
  //               email: true,
  //             },
  //           },
  //           location: true,
  //           areaInSqFt: true,
  //           amenities: true,
  //         },
  //       },
  //       landlord: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });
  // }
  // if(userRole===Role.LANDLORD){
  //   rentalRequests = await prisma.rentalRequest.findMany({
  //     where: { landlordId:userId },
  //     include: {
  //       rentalRequestProperty: {
  //         select: {
  //           id: true,
  //           rentStatus: true,
  //           approvedTenant: {
  //             select: {
  //               name: true,
  //               email: true,
  //             },
  //           },
  //           location: true,
  //           areaInSqFt: true,
  //           amenities: true,
  //         },
  //       },
  //       landlord: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });
  // }
  const rentalRequests=authGetRentalRequestsByUser(userId, userRole)
  return rentalRequests;
};

const getRentalRequestByIdServices = async (
  payload: IGetRentalRequestByIdPayload,
) => {
  const { rentalRequestId, userId, userRole } = payload;
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
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
        },
      },
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
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
  });
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

export const rentalRequestServices = {
  createRentalRequestServices,
  getRentalRequestsByTenantOrLandlordServices,
  getRentalRequestByIdServices,
};
