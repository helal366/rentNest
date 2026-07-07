import { StatusCodes } from "http-status-codes";
import { Prisma, RentStatus, Role } from "../../generated/prisma/client";
import {
  IAdminUpdatePropertyPayload,
  ILandlordUpdatePropertyPayload,
  TPropertyWithRequests,
} from "../modules/landlord/landlord_interfaces";
import { AppError } from "../utils/globalErrorHelper";
import { prisma } from "../lib/prisma";
import { validateAmenities } from "./amenitiesValidityCheck";
import { validateLocation } from "./locationValidityCheck";

export const propertyUpdateHelper = async(
  userRole: Role,
  payload: ILandlordUpdatePropertyPayload | IAdminUpdatePropertyPayload,
  property:TPropertyWithRequests
) => {
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
  if("category" in payload &&  payload.category){
      if(hasRentalRequest || hasTenant || notAvailable){
        throw new AppError("Can not change category after rental activity.",StatusCodes.BAD_REQUEST)
      };
      const category = await prisma.category.findUnique({
        where: {
            name: payload.category
        }
      });
      if(!category){
        throw new AppError("Category not found",StatusCodes.BAD_REQUEST)
      };
      updateData.propertyCategoryId = category.id;
  };

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
  return updateData
};
