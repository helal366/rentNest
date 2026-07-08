import { Router } from "express";
import { landlordControllers } from "./landlord_controllers";
import { userAuth } from "../../middlewares/userAuth";
import { Role } from "../../../generated/prisma/enums";

export const landlordRouter:Router=Router();
landlordRouter.post("/properties", userAuth(Role.LANDLORD), landlordControllers.creatPropertyController);
landlordRouter.put("/properties/:id", userAuth(Role.LANDLORD, Role.ADMIN), landlordControllers.updatePropertyController);
landlordRouter.delete("/properties/:id", userAuth(Role.LANDLORD), landlordControllers.deletePropertyController);
landlordRouter.get("/requests", userAuth(Role.LANDLORD), landlordControllers.getRentalRequestsByLandlordController)