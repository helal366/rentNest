import { StatusCodes } from "http-status-codes";
import { PropertyLocation } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";

type TPropertyFilters = {
  location?: PropertyLocation;
  minPrice?: number;
  maxPrice?: number;
  category?: string; // or category name
};
const getAllPropertiesServices = async (filters:TPropertyFilters) => {
  const {location, minPrice, maxPrice, category} = filters;
  const whereConditions:any={}
  if(location){
    whereConditions.location=location;
  }
  if(minPrice!==null || maxPrice!==null){
    if(maxPrice && minPrice){
        if(maxPrice < minPrice){
          throw new AppError("Max Price must greater than min price.", StatusCodes.BAD_REQUEST);
        }
      }
    whereConditions.AND = [];
      if(maxPrice!==null){
        whereConditions.AND.push({
          maxPrice:{
            gte:maxPrice
          }
        })
      };
      if(minPrice!==null){
        whereConditions.AND.push({
          minPrice:{
            lte:minPrice
          }
        })
      };
    };
    if(category){
      const propertyCategory = await prisma.category.findUniqueOrThrow({
        where: {
          name: category
        }
      });
      whereConditions.propertyCategoryId= propertyCategory.id;
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
