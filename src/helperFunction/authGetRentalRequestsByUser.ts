import { Role } from "#db-client";
import { prisma } from "../lib/prisma.js";
import { RentalRequestWithRelations } from "../modules/rentalRequest/rental_interfaces.js";

export const authGetRentalRequestsByUser = async(userId:string, userRole:Role):Promise<RentalRequestWithRelations[]>=>{
     const queryFilter = userRole === Role.TENANT 
    ? { tenantId: userId } 
    : { landlordId: userId };
     
      const rentalRequests = await prisma.rentalRequest.findMany({
    where: queryFilter,
    include: {
      rentalRequestProperty: {
        select: {
          id: true,
          rentStatus: true,
          approvedTenant: {
            select: {
              name: true,
              email: true,
            },
          },
          location: true,
          areaInSqFt: true,
          amenities: true,
        },
      },
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
      return rentalRequests 
}