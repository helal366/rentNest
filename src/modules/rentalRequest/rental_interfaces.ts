import { Role } from "../../../generated/prisma/enums";

export interface ICreateRentalRequestPayload{
    tenantId: string,
    tenantRole: Role,
    propertyId: string,
    landlordId: string
}

export interface IGetRentalRequestByIdPayload  {
        rentalRequestId:string,
        userId:string,
        userRole:Role
    }