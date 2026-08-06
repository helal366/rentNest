import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { propertyServices } from "./property_services.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper.js";
import {  PropertyLocation, RentStatus } from "#db-client"; 
import { getAllPropertiesQuerySchema } from "../../zod_schemas/propertyZodSchemas.js";

const getAllPropertiesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedQuery = getAllPropertiesQuerySchema.parse(req.query);

    const limit = parsedQuery.limit 
      ? parsedQuery.limit 
      : parsedQuery.perPage 
        ? parsedQuery.perPage
        : 12;

    const filters = {
      location: parsedQuery.location as PropertyLocation | undefined,
      rentStatus: parsedQuery.rentStatus as RentStatus | undefined,
      minPrice: parsedQuery.minPrice,
      maxPrice: parsedQuery.maxPrice,
      category: parsedQuery.category,
      amenities: parsedQuery.amenities, 
      page: parsedQuery.page,
      limit,
    };
    
    const result = await propertyServices.getAllPropertiesServices(filters);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Properties retrieved successfully.",
      data: {
        meta: {
          page: parsedQuery.page,
          limit,
          total: result.totalCount,
          totalPages: Math.ceil(result.totalCount / limit) || 1,
        },
        properties: result.allProperties,
      },
    });
  },
);


const getPropertyByIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    if (!propertyId) {
      throw new AppError("Property id is required.", StatusCodes.BAD_REQUEST);
    }
    const result = await propertyServices.getPropertyByIdServices(
      propertyId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Property retrieved successfully.",
      data: result,
    });
  },
);

export const propertyControllers = {
  getAllPropertiesController,
  getPropertyByIdController,
};
