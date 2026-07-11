import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { TPropertyFilters } from "./property_interfaces.js";
import { queryValidationCheck } from "../../helperFunction/queryValidationCheck.js";
const getAllPropertiesServices = async (filters: TPropertyFilters) => {
  const { location, minPrice, maxPrice, category } = filters;
  const propertyCategoryId = await queryValidationCheck(filters)
  const whereConditions: any = {};
  
  if (location) {
    whereConditions.location = location.toUpperCase();
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereConditions.price={};
    if (maxPrice !== undefined) {
      whereConditions.price.lte= maxPrice
    }
    if (minPrice !== undefined) {
      whereConditions.price.gte = minPrice
    }
  }
  if (category) {
    whereConditions.propertyCategoryId = propertyCategoryId;
  }

  const allProperties = await prisma.property.findMany({
    where: whereConditions,
    include: {
      category: true,
      propertyRentRequests: true,
      approvedTenant: true,
      landlord: true,
    },
  });
  return { allProperties };
};
const getPropertyByIdServices = async (propertyId: string) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
    include: {
      category: true,
      propertyRentRequests: true,
      approvedTenant: true,
      landlord: true,
    },
  });
  return { property };
};
export const propertyServices = {
  getAllPropertiesServices,
  getPropertyByIdServices,
};
