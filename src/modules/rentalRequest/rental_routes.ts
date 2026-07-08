import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";
import { rentalRequestControllers } from "./rental_controllers";

export const rentalRouter:Router = Router();
rentalRouter.post("/", userAuth(Role.TENANT), rentalRequestControllers.createRentalRequestController)