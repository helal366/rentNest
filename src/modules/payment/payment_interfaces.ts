import { Role, UserStatus, Review, Payment, RentalRequest, Property } from "#db-client";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // Optional if you exclude it in API responses for security
  userStatus: UserStatus;
  
  // Timestamps
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations (Optional based on Prisma include queries)
  tenantReviews?: Review[];
  payments?: Payment[];
  tenantRentalRequests?: RentalRequest[];
  approvedRentalProperties?: Property[];
  ownProperties?: Property[];
  requestsOwnProperty?: RentalRequest[];
}
