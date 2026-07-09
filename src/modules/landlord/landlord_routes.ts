import { Router } from "express";
import { landlordControllers } from "./landlord_controllers.js";
import { userAuth } from "../../middlewares/userAuth.js";
import { Role } from "#db-client"; 

export const landlordRouter: Router = Router();
landlordRouter.post(
  "/properties",
  userAuth(Role.LANDLORD),
  landlordControllers.creatPropertyController,
);
landlordRouter.put(
  "/properties/:id",
  userAuth(Role.LANDLORD, Role.ADMIN),
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
