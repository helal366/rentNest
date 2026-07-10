import { Role, UserStatus } from "#db-client"; 


export interface IRegisterUser {
  name: string;
  email: string;
  role: Role;
  password: string;
  userStatus?: UserStatus;
  address: string;
  contactNo: string
}

export interface ILoginUser {
  email: string;
  password: string;
}
