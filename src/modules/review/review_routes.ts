import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { reviewControllers } from "./review_controllers.js";
import { Role } from "#db-client"; 

export const reviewRouter: Router = Router();
reviewRouter.post(
  "/",
  userAuth(Role.TENANT),
  reviewControllers.createReviewController,
);
reviewRouter.delete("/:id", userAuth(Role.ADMIN), reviewControllers.deleteReviewcontroller)