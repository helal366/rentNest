import { Prisma, PropertyRentRequestStatus, Role } from "#db-client"; 


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

export type RentalRequestWithRelations = Prisma.RentalRequestGetPayload<{
  include: {
    rentalRequestProperty: {
      select: {
        id: true;
        rentStatus: true;
        approvedTenant: {
          select: {
            name: true;
            email: true;
          };
        };
        location: true;
        areaInSqFt: true;
        amenities: true;
      };
    };
    landlord: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;