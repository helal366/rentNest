import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper.js";
import { landlordServices } from "./landlord_services.js";
import { ICreatePropertyPayload } from "./landlord_interfaces.js";
import { userCheck } from "../../utils/userCheck.js";

const creatPropertyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body as ICreatePropertyPayload;
    if (!req.user) {
      throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    }
    // userCheck(req.user);
    const userId = req.user?.id;
    const result = await landlordServices.creatPropertyServices(
      payload,
      userId,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Property created successfully.",
      data: result,
    });
  },
);
const updatePropertyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    if (!propertyId) {
      throw new AppError("Property id is required.", StatusCodes.BAD_REQUEST);
    }
    if (!req.user) {
      throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    }
    // userCheck(req.user);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const payload = req.body;
    const result = await landlordServices.updatePropertyServices(
      propertyId as string,
      userId,
      payload,
      userRole,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Update successful",
      data: result,
    });
  },
);
const deletePropertyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    if (!propertyId) {
      throw new AppError("Property id is required.", StatusCodes.BAD_REQUEST);
    }
    if (!req.user) {
      throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    }
    // userCheck(req.user);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = await landlordServices.deletePropertyServices(
      propertyId as string,
      userId,
      userRole,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Property deleted successfully.",
      data: result,
    });
  },
);
const getRentalRequestsByLandlordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    };
    // userCheck(req.user);
    const landlordId = req.user.id;
    const landlordRole = req.user.role;
    const result = await landlordServices.getRentalRequestsByLandlordServices(
      landlordId,
      landlordRole,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Landlord rental requests retrieved successfully.",
      data: result,
    });
  },
);

const approveOrRejectRentalRequestController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Please login", StatusCodes.UNAUTHORIZED);
    };
    // userCheck(req.user);
    const rentalRequestId = req.params.id;
    if (!rentalRequestId || typeof rentalRequestId !== "string") {
      throw new AppError(
        "Rental request id is required as string.",
        StatusCodes.BAD_REQUEST,
      );
    }
    const { requestStatus } = req.body;
    if (!requestStatus) {
      throw new AppError(
        "Required requestStatus from body as PENDING or APPROVED or REJECTED",
        StatusCodes.BAD_REQUEST,
      );
    }

    const payload = {
      rentalRequestId,
      landlordId: req.user.id,
      landlordRole: req.user.role,
      requestStatus,
    };
    const result =
      await landlordServices.approveOrRejectRentalRequestServices(payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  },
);
export const landlordControllers = {
  creatPropertyController,
  updatePropertyController,
  deletePropertyController,
  getRentalRequestsByLandlordController,
  approveOrRejectRentalRequestController,
};
