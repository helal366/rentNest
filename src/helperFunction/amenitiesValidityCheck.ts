import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/globalErrorHelper.js";
// ✨ Enums are cleanly exported straight through the main client alias file!
import { PropertyAmenity } from "#db-client"; 

export const validateAmenities = (amenities: string[]) => {
  const validAmenities = Object.values(PropertyAmenity);

  const invalidAmenities = amenities.filter(
    (a) => !validAmenities.includes(a as PropertyAmenity),
  );

  if (invalidAmenities.length > 0) {
    throw new AppError(
      `Invalid amenities: ${invalidAmenities.join(", ")}. Valid amenities are: ${validAmenities.join(", ")}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  // ✅ return properly typed amenities
  return amenities as PropertyAmenity[];
};
