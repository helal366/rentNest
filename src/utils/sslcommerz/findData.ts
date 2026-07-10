import { prisma } from "../../lib/prisma.js";

export const findData=async(rentalRequestId:string)=>{
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: {
          id: rentalRequestId,
        },
      });

    const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: rentalRequest.propertyId,
    },
  });
  const tenant = await prisma.user.findUniqueOrThrow({
    where: {
      id: rentalRequest.tenantId,
    },
  });
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id: property.propertyCategoryId,
    },
  });
  return {rentalRequest,property, tenant, category};
}