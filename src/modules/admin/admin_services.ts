import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/globalErrorHelper.js";
import { validateUserStatus } from "../../helperFunction/userStatusvalidityCheck.js";

const getAllUsersServices=async()=>{
    const [totalUsers, users] =  await prisma.$transaction([
     prisma.user.count({ where: { isDeleted: false } }), 
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            tenantReviews: true,
            tenantPayments: true,
            landlordPayments: true,
            tenantRentalRequests: true,
            approvedRentalProperties: true,
            ownProperties: true,
            requestsOwnProperty: true,
          },
        },
        tenantReviews: {
          select: {
            content: true,
            rating: true,
            tenant: {
              select: {
                name: true,
                email: true,
                address: true,
                contactNo: true,
              },
            },
            property: {
              select: {
                rentPrice: true,
                areaInSqFt: true,
                amenities: true,
                location: true,
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
        },
        ownProperties: {
          select: {
            _count: {
              select: {
                propertyRentRequests: true,
                propertyReviews: true,
              },
            },
            rentPrice: true,
            areaInSqFt: true,
            amenities: true,
            location: true,
            category: {
              select: {
                name: true,
              },
            },
            propertyRentRequests: {
              select: {
                isPaid: true,
                requestStatus: true,
                tenant: {
                  select: {
                    name: true,
                    email: true,
                    role: true,
                    address: true,
                    contactNo: true,
                  },
                },
              },
            },
            approvedTenant: {
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
      omit: {
        password: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
     ]);
    return {
      meta: {
        totalUsers,
      },
      users,
    };
};

const getAllPropertiesServices=async()=>{
    const properties = await prisma.property.findMany({
        omit:{
            isDeleted: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy:{
            rentPrice:"asc"
        }
    });
    return properties
};

const getAllRentalRequestsServices = async () => {
  // Use a transaction to safely fetch both values parallelly in one single database call
  const [totalCount, rentalRequests] = await prisma.$transaction([
    prisma.rentalRequest.count(), // Safely counts overall entries inside the table

    prisma.rentalRequest.findMany({
      include: {
        rentalRequestProperty: {
          select: {
            rentPrice: true,
            location: true,
            areaInSqFt: true,
            amenities: true,
            category: {
              select: {
                name: true,
              },
            },
            landlord: {
              select: {
                name: true,
                email: true,
                address: true,
                contactNo: true,
              },
            },
            approvedTenant: {
              select: {
                name: true,
                email: true,
                address: true,
                contactNo: true,
              },
            },
            propertyReviews: {
              select: {
                content: true,
                rating: true,
                tenant: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  // Return a standard structural meta wrapper object
  return {
    meta: {
      total: totalCount,
    },
    data: rentalRequests,
  };
};

const updateUserBanUnbanServices=async(userId:string, userStatus: string)=>{
    const validStatus=validateUserStatus(userStatus)
    const user = await prisma.user.findUniqueOrThrow({
        where:{id:userId}
    });
    if(user.userStatus === validStatus){
        throw new AppError("Already updated to the required status",StatusCodes.BAD_REQUEST)
    };
    const updatedUser=await prisma.user.update({
        where:{id:userId},
        data:{
            userStatus: validStatus
        },
        select: {
            id:true,
            name: true,
            email: true,
            role: true,
            userStatus: true
        }
    });
    return updatedUser
}
export const adminServices={
    getAllUsersServices,
    getAllPropertiesServices,
    getAllRentalRequestsServices,
    updateUserBanUnbanServices
}