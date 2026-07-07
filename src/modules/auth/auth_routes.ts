import { Request, Response, Router } from "express";
import { authControllers } from "./auth_controllers";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";

export const authRouter:Router = Router();
authRouter.post("/register", authControllers.authRegisterController);
authRouter.post("/login", authControllers.authLoginController);
authRouter.get("/me", userAuth(Role.TENANT, Role.LANDLORD, Role.ADMIN), authControllers.getAuthMeController);
authRouter.post("/refresh-token", authControllers.refreshTokenController);
