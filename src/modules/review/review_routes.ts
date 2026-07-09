import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { reviewControllers } from "./review_controllers.js";

export const reviewRouter: Router = Router();
reviewRouter.post(
  "/",
  userAuth(Role.TENANT),
  reviewControllers.createReviewController,
);
