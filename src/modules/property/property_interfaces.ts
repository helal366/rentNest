import { PropertyAmenity, PropertyLocation, RentStatus } from "#db-client"; 


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
export type TPropertyFilters = {
  location?: PropertyLocation;
  minPrice?: number;
  maxPrice?: number;
  category?: string; // or category name
};