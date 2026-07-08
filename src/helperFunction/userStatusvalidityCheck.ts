
import { StatusCodes } from "http-status-codes";
import { UserStatus } from "../../generated/prisma/enums";
import { AppError } from "../utils/globalErrorHelper";

export const validateUserStatus = (userStatus: string): UserStatus => {

  const normalizedUserStatus = userStatus.toUpperCase();

  const validUserStatuses = Object.values(UserStatus);

  if (!validUserStatuses.includes(normalizedUserStatus as UserStatus)) {
    throw new AppError(
      `Invalid user status: ${userStatus}. Allowed user statuses are: ${validUserStatuses.join(", ")}`,
      StatusCodes.BAD_REQUEST
    );
  }

  return normalizedUserStatus as UserStatus;
};