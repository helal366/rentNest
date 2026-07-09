import { IProperty } from "../property/property_interfaces.js";

export interface ICategory {
  id: string;
  name: string;
//   properties?: IProperty[]; // optional because Prisma doesn't always include relations
//   isDeleted: boolean;
//   deletedAt: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
}