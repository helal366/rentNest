import { PropertyAmenity, PropertyLocation, RentStatus } from "#db-client";
import { z } from "zod";

export const PropertyAmenityZodEnum = z.enum(PropertyAmenity);
export const PropertyLocationZodEnum = z.enum(PropertyLocation);
export const RentStatusZodEnum = z.enum(RentStatus);

export const createPropertyValidationSchema = z.object({
  body: z.object({
    category: z
      .string({ message: "Category is required" })
      .trim()
      .min(1, "Category cannot be empty"),

    rentPrice: z
      .number({ message: "Rent price is required" })
      .int("Rent price must be a whole number.")
      .positive("Rent price must be a positive whole number."), // Changed to positive

    amenities: z
      .array(PropertyAmenityZodEnum, {
        message: "Amenities must be an array.",
      })
      .min(1, "At least one amenity must be selected."), // Prevents empty arrays

    rentStatus: RentStatusZodEnum.default("AVAILABLE").optional(),

    location: PropertyLocationZodEnum.default("JATRABARI")
      .optional()
      .or(z.literal("").transform(() => "JATRABARI")),

    areaInSqFt: z
      .number({ message: "Area in SqFt is required" })
      .positive("Area must be a positive number.")
      .default(1000)
      .optional(),
  }),
});

export type ICreatePropertyZodSchema = z.infer<typeof createPropertyValidationSchema>;
