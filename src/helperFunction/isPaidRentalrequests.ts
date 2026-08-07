import { Role } from "#db-client";
import { prisma } from "../lib/prisma.js";
import { RentalRequestWithRelations } from "../modules/rentalRequest/rental_interfaces.js";

export const isPaidRentalrequests = async (userId: string): Promise<RentalRequestWithRelations[]> => {

  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
        tenantId:userId,
        isPaid: true
    },
    include: {
      rentalRequestProperty: {
        select: {
          id: true,
          rentStatus: true,
          category:{
            select:{
              name: true
            }
          },
          approvedTenant: {
            select: {
              name: true,
              email: true,
            },
          },
          propertyReviews:{
            select:{
                id: true,
                rating: true,
                content: true
            }
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
      payments:{
        select:{
            id:true,
            tenantId: true,
            paymentStatus: true
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return rentalRequests;
};