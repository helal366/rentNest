import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { adminControllers } from "./admin_controllers.js";
import { Role } from "#db-client"; 

export const adminRouter: Router = Router();
adminRouter.get(
  "/users",
  userAuth(Role.ADMIN),
  adminControllers.getAllUsersController,
);
adminRouter.get(
  "/properties",
  userAuth(Role.ADMIN),
  adminControllers.getAllPropertiesController,
);
adminRouter.get(
  "/rentals",
  userAuth(Role.ADMIN),
  adminControllers.getAllRentalRequestsController,
);
adminRouter.patch(
  "/users/:id",
  userAuth(Role.ADMIN),
  adminControllers.updateUserBanUnbanController,
);
