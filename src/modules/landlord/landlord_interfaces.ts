import { Prisma } from "../../../generated/prisma/client";
import { PropertyAmenity, PropertyLocation, RentStatus } from "../../../generated/prisma/enums";

export interface ICreatePropertyPayload{
    category: string,
    rentPrice: number,
    rentStatus?: RentStatus,
    amenities: PropertyAmenity[],
    location?: PropertyLocation,
    areaInSqFt?: number
}
export interface ILandlordUpdatePropertyPayload{
    category?: string,
    rentPrice?: number,
    rentStatus?: RentStatus,
    amenities?: PropertyAmenity[],
    location?: PropertyLocation,
    areaInSqFt?: number,
    approvedTenantId?: string | null
}
export interface IAdminUpdatePropertyPayload{
    landlordId?: string,
    deletedAt?: Date | string | null,
}
export interface IUpdatePropertyPayload{
  category?: string;
  rentPrice?: number;
  rentStatus?: RentStatus;
  amenities?: PropertyAmenity[];
  location?: PropertyLocation;
  areaInSqFt?: number;
  approvedTenantId?: string | null;

  // restricted (ignore for landlord)
  landlordId?: string;
  isDeleted?: boolean;
  deletedAt?: Date | string | null;
  propertyCategoryId?: string;
};

// import { Prisma } from "@prisma/client";
export type TPropertyWithRequests = Prisma.PropertyGetPayload<{
  include: {
    propertyRentRequests: true;
    approvedTenant: true;
  };
}>;