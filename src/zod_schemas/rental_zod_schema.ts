import { z } from "zod";

export const createRentalRequestValidationSchema = z.object({
  body: z.object({
    // Use first-class z.uuid() function directly instead of string chain
    propertyId: z.uuid({
      message: "Invalid Property ID format. Must be a valid UUID.",
    }),
    landlordId: z.uuid({
      message: "Invalid Landlord ID format. Must be a valid UUID.",
    }),
  }),
});

export type CreateRentalRequestInput = z.infer<
  typeof createRentalRequestValidationSchema
>;
