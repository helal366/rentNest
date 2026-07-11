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

// Confirm payment via IPN Webhook or Status Gateway Redirect Callbacks
paymentRouter.post(
  "/confirm",
  paymentControllers.confirmPaymentController,
);

// Get authenticated user's payment history
paymentRouter.get(
  "/",
  userAuth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentControllers.getPaymentHistoryController,
);

// Get single payment trace details
paymentRouter.get(
  "/:id",
  userAuth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  paymentControllers.getPaymentHistorByIdyController,
);