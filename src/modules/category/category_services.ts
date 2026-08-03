import { prisma } from "../../lib/prisma.js"
import { ICategory } from "./category_interfaces.js";

const getAllCategoriesServices = async () => {
  const [totalCount, categoryDetails] = await prisma.$transaction([
    prisma.category.count({
      where: {
        isDeleted: false,
      },
    }),

    prisma.category.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        properties: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            rentStatus: true,
            rentPrice: true,
            areaInSqFt: true,
            location: true,
            amenities: true,
            landlord: {
              select: {
                name: true,
                email: true,
                address: true,
                contactNo: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Return both meta count and the data payload
  return {
    meta: {
      count: totalCount,
    },
    categories: categoryDetails,
  };
};

export const categoryServices={
    getAllCategoriesServices
}