import { PropertyAmenity, PropertyLocation, RentStatus } from "#db-client";
import { z } from "zod";

// 1. Map Prisma Enums to Zod Enums to enforce exact structural matches
// Simply wrap the Prisma enum directly
export const PropertyAmenityZodEnum = z.enum(PropertyAmenity);
export const PropertyLocationZodEnum = z.enum(PropertyLocation);
export const RentStatusZodEnum = z.enum(RentStatus);

// 2. Main Create Property Validation Schema
export const createPropertyValidationSchema = z.object({
  body: z.object({
    category: z
      .string({ message: "Category is required" })
      .trim()
      .min(1, "Category cannot be empty"),

    rentPrice: z
      .number({ message: "Rent price is required" })
      .int("Rent price must be a whole number.")
      .nonnegative("Rent price must be a positive whole number."),

    amenities: z.array(PropertyAmenityZodEnum, {
      message: "Amenities must be an array.",
    }),

    rentStatus: RentStatusZodEnum.default("AVAILABLE").optional(),

    location: PropertyLocationZodEnum.default("JATRABARI")
      .optional()
      .or(z.literal("").transform(() => "JATRABARI")), // Handles empty or trimmed space strings

    areaInSqFt: z
      .number({ message: "Area in SqFt is required" })
      .positive("Area must be a positive number.")
      .default(1000)
      .optional(),
  }),
});

// 3. Infer TypeScript Type from Zod Schema
export type ICreatePropertyPayload = z.infer<
  typeof createPropertyValidationSchema
>["body"];
