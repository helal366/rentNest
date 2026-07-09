import { Router } from "express";
import { propertyControllers } from "./property_controllers.js";

export const propertyRouter:Router = Router();

propertyRouter.get("/", propertyControllers.getAllPropertiesController);
propertyRouter.get("/:id", propertyControllers.getPropertyByIdController);