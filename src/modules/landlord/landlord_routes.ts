import { Router } from "express";
import { landlordControllers } from "./landlord_controllers.js";
import { userAuth } from "../../middlewares/userAuth.js";
import { Role } from "#db-client"; 
import { validateRequestBody } from "../../middlewares/validateRequestBody.js";
import { updatePropertyValidationSchema } from "../../zod_schemas/update_property_zod_schema.js";
import { createPropertyValidationSchema } from "../../zod_schemas/createPropertyZodSchema.js";

export const landlordRouter: Router = Router();
landlordRouter.post(
  "/properties",
  userAuth(Role.LANDLORD),
  validateRequestBody(createPropertyValidationSchema),
  landlordControllers.creatPropertyController,
);
landlordRouter.patch(
  "/properties/:id",
  userAuth(Role.LANDLORD, Role.ADMIN),
  validateRequestBody(updatePropertyValidationSchema),
  landlordControllers.updatePropertyController,
);
landlordRouter.delete(
  "/properties/:id",
  userAuth(Role.LANDLORD),
  landlordControllers.deletePropertyController,
);
landlordRouter.get(
  "/requests",
  userAuth(Role.LANDLORD),
  landlordControllers.getRentalRequestsByLandlordController,
);
landlordRouter.patch(
  "/requests/:id",
  userAuth(Role.LANDLORD),
  landlordControllers.approveOrRejectRentalRequestController,
);
landlordRouter.get(
  "/my_properties",
  userAuth(Role.LANDLORD),
  landlordControllers.getMyPropertiesController, 
);
landlordRouter.get(
  "/my_properties/:id",
  userAuth(Role.LANDLORD),
  landlordControllers.getMySinglePropertyController,
);
