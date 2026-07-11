import { Request, Response, Router } from "express";
import { authControllers } from "./auth_controllers.js";
import { userAuth } from "../../middlewares/userAuth.js";
import { Role } from "#db-client"; 

export const authRouter: Router = Router();
authRouter.post("/register", userAuth(Role.TENANT, Role.LANDLORD), authControllers.authRegisterController);
authRouter.post("/login", authControllers.authLoginController);
authRouter.get(
  "/me",
  userAuth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  authControllers.getAuthMeController,
);
authRouter.post("/refresh-token", authControllers.refreshTokenController);
