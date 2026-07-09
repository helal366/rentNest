import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { categoryControllers } from "./category_controllers.js";
import { Role } from "#db-client"; 

export const categoryRouter: Router = Router();

categoryRouter.get(
  "/",
  userAuth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  categoryControllers.getAllCategoriesController,
);
