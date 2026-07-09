import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { rentalRequestControllers } from "./rental_controllers.js";
import { Role } from "#db-client"; 

export const rentalRouter: Router = Router();
rentalRouter.post(
  "/",
  userAuth(Role.TENANT),
  rentalRequestControllers.createRentalRequestController,
);
rentalRouter.get(
  "/",
  userAuth(Role.TENANT),
  rentalRequestControllers.getRentalRequestsByTenantController,
);
rentalRouter.get(
  "/:id",
  userAuth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  rentalRequestControllers.getRentalRequestByIdController,
);
