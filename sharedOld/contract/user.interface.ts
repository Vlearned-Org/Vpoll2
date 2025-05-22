import { UserStatusEnum, UserTokenEnum } from "../enum/user.enum";
import { ISODateTime } from "../type/date.type";
import { Role } from "./context.interface";
import { InternalFile } from "./filesystem.interface";

export enum AccountVerificationStatusEnum {
  NONE = "none",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface UserVerificationDto {
  identity: string;
  identityDocument: string;
  email?: string;
  name?: string;
}

export interface Token {
  source: UserTokenEnum;
  token: string;
  expiresAt?: ISODateTime;
}

export interface User {
  _id: string;
  isAdmin: boolean;
  password: string;
  status: UserStatusEnum;
  tokens: Array<Token>;
  roles: Array<Role>;

  name?: string;
  firstLoginAt?: Date;
  lastLoginAt?: Date;

  // Admin is Mandatory
  email?: string;

  // User is Mandatory
  mobile?: string;

  // Shareholder/Proxy is Mandatory
  nric?: string;
  nricRef?: InternalFile;
  accountVerificationStatus?: AccountVerificationStatusEnum;
  rejectMessage?: string;
}
