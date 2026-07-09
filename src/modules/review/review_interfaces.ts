import { Role } from "#db-client"; 


export interface ICreateReviewPayload {
  tenantId: string;
  tenantRole: Role;
  propertyId: string;
  content: string;
  rating: number;
}
