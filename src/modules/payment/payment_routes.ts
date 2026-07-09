import { Router } from "express";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";
import { paymentControllers } from "./payment_controllers";

export const paymentRouter:Router=Router();
paymentRouter.post("/create", userAuth(Role.TENANT), paymentControllers.createPaymentController)