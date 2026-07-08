import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";
import { adminControllers } from "./admin_controllers";

export const adminRouter:Router=Router();
adminRouter.get("/users", userAuth(Role.ADMIN), adminControllers.getAllUsersController);
adminRouter.get("/properties", userAuth(Role.ADMIN), adminControllers.getAllPropertiesController)