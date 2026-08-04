import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { TPropertyFilters } from "./property_interfaces.js";
import { queryValidationCheck } from "../../helperFunction/queryValidationCheck.js";

const getAllPropertiesServices = async (filters: TPropertyFilters) => {
  const {
    location,
    minPrice,
    maxPrice,
    category,
    rentStatus,
    amenities,
    page = 1,
    limit = 12,
  } = filters;
  const propertyCategoryId = await queryValidationCheck(filters);
  const whereConditions: any = {};

  if (rentStatus) {
    whereConditions.rentStatus = rentStatus;
  }
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
      skip: skipValue,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        propertyRentRequests: {
          select: {
            id: true,
            isPaid: true,
            requestStatus: true,
          },
        },
        approvedTenant: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            userStatus: true,
          },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            userStatus: true,
          },
        },
      },
    }),
    prisma.property.count({ where: whereConditions }),
  ]);

  return { allProperties, totalCount };
};

const getPropertyByIdServices = async (propertyId: string) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      propertyRentRequests: {
        select: {
          requestStatus: true,
          isPaid: true,
          tenant: {
            select: {
              name: true,
              email: true,
              contactNo: true,
              address: true,
              userStatus: true,
            },
          },
          
        },
      },
      approvedTenant: {
        select: {
          name: true,
          email: true,
          contactNo: true,
          address: true,
          userStatus: true,
        },
      },
      
      landlord: {
        select: {
          id:true,
          name: true,
          email: true,
          contactNo: true,
          address: true,
          userStatus: true,
        },
      },
      propertyReviews:{
        select: {
          content: true,
          rating: true,
          tenant:{
            select:{
              name: true,
              email: true
            }
          }
        }
      }
    },
  });
  return { property };
};

export const propertyServices = {
  getAllPropertiesServices,
  getPropertyByIdServices,
};
