import { Role, UserStatus } from "../../../generated/prisma/enums.js";

export interface IRegisterUser {
  name: string;
  email: string;
  role: Role;
  password: string;
  userStatus?: UserStatus;
}

export interface ILoginUser {
  email: string;
  password: string;
}
