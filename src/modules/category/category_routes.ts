import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";
import { categoryControllers } from "./category_controllers";

export const categoryRouter:Router=Router();

categoryRouter.get("/", userAuth(Role.ADMIN, Role.LANDLORD, Role.TENANT),categoryControllers.getAllCategoriesController)