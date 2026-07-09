import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/globalErrorHelper.js";
import { ILoginUser, IRegisterUser } from "./auth_interfaces.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/index.js";
import { userCheck } from "../../utils/userCheck.js";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtTokens } from "../../utils/jwtTokens.js";
import { Role, UserStatus } from "#db-client"; 

const authRegisterServices = async (payload: IRegisterUser) => {
  const { name, email, role, password } = payload;
  const fields = { name, email, role, password };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "string" || value?.trim() === "") {
      throw new AppError(`${key} is not provided`, StatusCodes.BAD_REQUEST);
    }
  }
  const allowedRoles: Role[] = [Role.TENANT, Role.LANDLORD];
  if (!allowedRoles.includes(role)) {
    throw new AppError(
      "Role must be either TENANT or LANDLORD",
      StatusCodes.BAD_REQUEST,
    );
  }
  const userExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExist) {
    throw new AppError(
      `User is already exist with email: ${email} as a role: ${userExist.role}`,
      StatusCodes.BAD_REQUEST,
    );
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND),
  );
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: createdUser.id,
      email,
    },
    omit: {
      password: true,
    },
  });
  return { user };
};
const authLoginServices = async (payload: ILoginUser) => {
  const { email, password } = payload;
  const fields = { email, password };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "string" || value?.trim() === "") {
      throw new AppError(`${key} is not provided`, StatusCodes.BAD_REQUEST);
    }
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      userStatus: true,
    },
  });
  userCheck(user);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", StatusCodes.BAD_REQUEST);
  }
  const jwtPayload: JwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    userStatus: user.userStatus,
  };
  const accessToken = jwtTokens.createToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES_IN as SignOptions, // StringValue
  );

  const refreshToken = jwtTokens.createToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES_IN as SignOptions, //StringValue
  );

  return { accessToken, refreshToken };
};
const getAuthMeServices = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });
  return {
    user,
  };
};
const refreshTokenServices = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtTokens.verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET,
  );
  if (!verifiedRefreshToken.success) {
    throw new AppError(
      `${verifiedRefreshToken.error}`,
      StatusCodes.BAD_REQUEST,
    );
  }
  const { id } = verifiedRefreshToken.data as JwtPayload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    omit: { password: true },
  });
  if (user.userStatus === UserStatus.BANNED) {
    throw new AppError("This user is banned", StatusCodes.BAD_REQUEST);
  }
  const jwtPayload: JwtPayload = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    userStatus: user.userStatus,
  };
  const accessToken = jwtTokens.createToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES_IN as SignOptions,
  );
  return { accessToken };
};
export const authServices = {
  authRegisterServices,
  authLoginServices,
  getAuthMeServices,
  refreshTokenServices,
};
