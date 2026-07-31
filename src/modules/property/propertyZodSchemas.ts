import { z } from "zod";

export const getAllPropertiesQuerySchema = z.object({
  location: z
    .string()
    .toUpperCase()
    .optional(),

   category: z
    .string()
    .toUpperCase()
    .optional(),
    
   rentStatus: z
    .string()
    .toUpperCase()
    .pipe(z.enum(["AVAILABLE", "RENTED", "PENDING"]))
    .optional(),

  minPrice: z.coerce.number({ error: () => "minPrice must be a number" }).optional(),
  maxPrice: z.coerce.number({ error: () => "maxPrice must be a number" }).optional(),
  
  amenities: z
    .preprocess((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return String(val).split(",").map(s => s.trim());
    }, z.array(z.enum(["WIFI", "PARKING", "AIR_CONDITIONING", "HEATING", "KITCHEN", "WASHER", "DRYER", "SWIMMING_POOL", "GYM", "ELEVATOR"])))
    .optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).optional(),
})
.strict();
