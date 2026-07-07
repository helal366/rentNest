
import { StatusCodes } from "http-status-codes";
import { PropertyLocation } from "../../generated/prisma/enums";
import { AppError } from "../utils/globalErrorHelper";

export const validateLocation = (location: string): PropertyLocation => {
  // ✅ If not provided → use default
  // if (!location || location?.trim() === "") {
  //   return PropertyLocation.JATRABARI;
  // }

  const normalizedLocation = location.toUpperCase();

  const validLocations = Object.values(PropertyLocation);

  if (!validLocations.includes(normalizedLocation as PropertyLocation)) {
    throw new AppError(
      `Invalid location: ${location}. Allowed locations are: ${validLocations.join(", ")}`,
      StatusCodes.BAD_REQUEST
    );
  }

  return normalizedLocation as PropertyLocation;
};