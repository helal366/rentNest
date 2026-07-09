import { Role } from "#db-client"; 


export interface ICreateRentalRequestPayload {
  tenantId: string;
  tenantRole: Role;
  propertyId: string;
  landlordId: string;
}

export interface IGetRentalRequestByIdPayload {
  rentalRequestId: string;
  userId: string;
  userRole: Role;
}
