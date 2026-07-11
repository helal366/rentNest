import { StatusCodes } from "http-status-codes";
import { TPropertyFilters } from "../modules/property/property_interfaces.js";
import { AppError } from "../utils/globalErrorHelper.js";
import { PropertyLocation } from "#db-client";
import { prisma } from "../lib/prisma.js";

export const queryValidationCheck = async (filters: TPropertyFilters) => {
  const { location, minPrice, maxPrice, category } = filters;
  if (location) {
    const upperLocation = location.toUpperCase();
    const isValidLocation = upperLocation in PropertyLocation;
    if (!isValidLocation) {
      throw new AppError(
        `Invalid location: '${location}'. Must be one of: ${Object.keys(PropertyLocation).join(", ")}`,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    if (maxPrice !== undefined && minPrice !== undefined) {
      if (maxPrice < minPrice) {
        throw new AppError(
          "Max Price must greater than min price.",
          StatusCodes.BAD_REQUEST,
        );
      }
    }
  }

  if (category) {
    const propertyCategory = await prisma.category.findUnique({
      where: {
        name: category.toUpperCase(),
      },
    });
    if(propertyCategory){
        return propertyCategory.id;
    }
    if (!propertyCategory) {
      const allCategories = await prisma.category.findMany({
        select: {
          name: true,
        },
      });
      const categoryNames = allCategories.map((category) => category.name);
      throw new AppError(`Invalid category name. Existing category names are: ${categoryNames.join(", ")}`, StatusCodes.BAD_REQUEST)
      
    }
  }
};
