import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/globalErrorHelper";
import { Role } from "../../../generated/prisma/enums";
interface ICreateRentalRequestPayload{
    tenantId: string,
    tenantRole: Role,
    propertyId: string,
    landlordId: string
}
const createRentalRequestServices=async(payload:ICreateRentalRequestPayload)=>{
    const {tenantId, tenantRole, propertyId, landlordId} = payload;
    if(tenantRole!==Role.TENANT){
        throw new Error("Please login as TENANT.");
    }
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId
        }
    });
    if(landlordId !==property.landlordId){
        throw new AppError("Property ownership mismatch: The selected property does not belong to the specified landlord.", StatusCodes.BAD_REQUEST)
    };
    const existingRequest =await prisma.rentalRequest.findUnique({
        where:{
            uniqueTenantPropertyRequest:{
                tenantId,
                propertyId
            }
        }
    });
    if(existingRequest){
        throw new AppError("You have already submitted a rental request for this property.",StatusCodes.BAD_REQUEST)
    }
    const rentalRequest = await prisma.rentalRequest.create({
        data:{
            landlordId,
            propertyId,
            tenantId
        }
    });
    return rentalRequest;
};
export const rentalRequestServices={
    createRentalRequestServices
}