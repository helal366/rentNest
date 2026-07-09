import { PropertyAmenity, PropertyLocation, RentStatus } from "@prisma/client";

export interface IProperty {
  id: string;
  propertyCategoryId: string;
  rentStatus: RentStatus;

  landlordId: string;
  approvedTenantId: string | null;

  rentPrice: number;
  location: PropertyLocation;
  areaInSqFt: number;
  amenities: PropertyAmenity[];

  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}