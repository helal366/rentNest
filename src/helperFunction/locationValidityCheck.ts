import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/globalErrorHelper.js";
import { PropertyLocation } from "#db-client"; 
export const validateLocation = (location: string): PropertyLocation => {

  const normalizedLocation = location.toUpperCase();

  const validLocations = Object.values(PropertyLocation);

  if (!validLocations.includes(normalizedLocation as PropertyLocation)) {
    throw new AppError(
      `Invalid location: ${location}. Allowed locations are: ${validLocations.join(", ")}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  return normalizedLocation as PropertyLocation;
};
