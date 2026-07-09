import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { paymentControllers } from "./payment_controllers.js";
import { Role } from "#db-client"; 

export const paymentRouter: Router = Router();
paymentRouter.post(
  "/create",
  userAuth(Role.TENANT),
  paymentControllers.createPaymentController,
);
