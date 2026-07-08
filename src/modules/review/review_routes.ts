import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";
import { reviewControllers } from "./review_controllers";

export const reviewRouter:Router=Router();
reviewRouter.post("/", userAuth(Role.TENANT), reviewControllers.createReviewController)