import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { TPropertyFilters } from "./property_interfaces.js";
import { queryValidationCheck } from "../../helperFunction/queryValidationCheck.js";


const getAllPropertiesServices = async (filters: TPropertyFilters) => {
  const { location, minPrice, maxPrice, category, amenities, page = 1, limit = 10 } = filters;
  const propertyCategoryId = await queryValidationCheck(filters);
  const whereConditions: any = {};
  
  // 1. Location Filtering
  if (location) {
    whereConditions.location = location.toUpperCase();
  }

  // 2. Price Boundary Filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereConditions.rentPrice = {};
    if (maxPrice !== undefined) {
      whereConditions.rentPrice.lte = Number(maxPrice);
    }
    if (minPrice !== undefined) {
      whereConditions.rentPrice.gte = Number(minPrice);
    }
  }

  // 3. Category Filtering
  if (category) {
    whereConditions.propertyCategoryId = propertyCategoryId;
  }

  // 4. Amenities Filtering Logic
  // Handles single inputs ("WIFI") and multiple entries (["WIFI", "GYM"]) seamlessly
  if (amenities && amenities.length > 0) {
    whereConditions.amenities = {
      hasSome: amenities, // Finds properties containing ANY of the listed amenities
    };
  }

  // 5. Calculate Skip (Offset) values based on page numbers
  const skipValue = (page - 1) * limit;

  // 6. Fetch records and execution total counts in parallel 
  const [allProperties, totalCount] = await prisma.$transaction([
    prisma.property.findMany({
      where: whereConditions,
      skip: skipValue,   // Offset pointer
      take: limit,       // Count limit constraint
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        propertyRentRequests: true,
        approvedTenant: true,
        landlord: true,
      },
    }),
    prisma.property.count({ where: whereConditions })
  ]);

  return { allProperties, totalCount };
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
