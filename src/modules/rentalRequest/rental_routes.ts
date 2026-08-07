import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { rentalRequestControllers } from "./rental_controllers.js";
import { Role } from "#db-client"; 
import { createRentalRequestValidationSchema } from "../../zod_schemas/rental_zod_schema.js";
import { validateRequestBody } from "../../middlewares/validateRequestBody.js";

export const rentalRouter: Router = Router();
rentalRouter.post(
  "/",
  userAuth(Role.TENANT),
  validateRequestBody(createRentalRequestValidationSchema),
  rentalRequestControllers.createRentalRequestController,
);
rentalRouter.get(
  "/",
  userAuth(Role.TENANT, Role.LANDLORD),
  rentalRequestControllers.getRentalRequestsByTenantOrLandlordController,
);
rentalRouter.get(
  "/isPaid",
  userAuth(Role.TENANT),
  rentalRequestControllers.getRentalRequestsIsPaidController,
);
rentalRouter.get(
  "/:id",
  userAuth(Role.LANDLORD, Role.TENANT),
  rentalRequestControllers.getRentalRequestByIdController,
);
