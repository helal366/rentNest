import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { rentalRequestControllers } from "./rental_controllers.js";
import { Role } from "#db-client"; 
import { createRentalRequestValidationSchema } from "./rental_zod_schema.js";
import { validateRentalRequest } from "../../middlewares/validateRentalRequest.js";

export const rentalRouter: Router = Router();
rentalRouter.post(
  "/",
  userAuth(Role.TENANT),
  validateRentalRequest(createRentalRequestValidationSchema),
  rentalRequestControllers.createRentalRequestController,
);
rentalRouter.get(
  "/",
  userAuth(Role.TENANT, Role.LANDLORD),
  rentalRequestControllers.getRentalRequestsByTenantOrLandlordController,
);
rentalRouter.get(
  "/:id",
  userAuth(Role.LANDLORD, Role.TENANT),
  rentalRequestControllers.getRentalRequestByIdController,
);
