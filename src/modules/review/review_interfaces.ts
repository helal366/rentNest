import { Role } from "../../../generated/prisma/enums";

export interface ICreateReviewPayload {
  tenantId: string;
  tenantRole: Role;
  propertyId: string;
  content: string;
  rating: number;
}