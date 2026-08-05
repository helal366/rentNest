import { PropertyAmenity, PropertyLocation, RentStatus } from "#db-client";
import { z } from "zod";

export const updatePropertyValidationSchema = z.object({
  body: z.object({
    category: z
      .string()
      .trim()
      .min(1, {
        message: "Category name cannot be an empty string if provided.",
      })
      .optional(),

    rentPrice: z
      .number({ message: "Rent price must be a valid number whole integer." })
      .int({ message: "Rent price must be a positive whole number integer." })
      .nonnegative({ message: "Rent price cannot be a negative value." })
      .optional(),

    // Use z.nativeEnum on the backend Prisma object array (Safe & compilation error-free in Zod v4)
    location: z
      .enum(PropertyLocation, {
        message: "Invalid location zone specified for Dhaka footprint.",
      })
      .optional(),

    areaInSqFt: z
      .number({ message: "Area footprint size must be a valid number layout." })
      .positive({
        message: "Area in Sq Ft must be a positive number greater than 0.",
      })
      .optional(),

    // Validates that every array item matches a valid Prisma Enum entry
    amenities: z
      .array(
        z.enum(PropertyAmenity, {
          message: "Contains an invalid system amenity enum value.",
        }),
        {
          message: "Amenities data block must be structured as an array list.",
        },
      )
      .optional(),

    rentStatus: z
      .enum(RentStatus, {
        message: "Invalid availability matrix rent status specified.",
      })
      .optional(),

    approvedTenantId: z.uuid({
        message:
          "Assigned approved tenant ID reference must match a valid UUID signature string format.",
      })
      .nullable()
      .optional(),
  }),
});

export type UpdatePropertyInput = z.infer<
  typeof updatePropertyValidationSchema
>;
