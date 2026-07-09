import { Role } from "../../../generated/prisma/enums.js";

export interface ICreateReviewPayload {
  tenantId: string;
  tenantRole: Role;
  propertyId: string;
  content: string;
  rating: number;
}
