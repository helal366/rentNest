import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { paymentControllers } from "./payment_controllers.js";

export const paymentRouter: Router = Router();
paymentRouter.post(
  "/create",
  userAuth(Role.TENANT),
  paymentControllers.createPaymentController,
);
