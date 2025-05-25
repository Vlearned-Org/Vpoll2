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

  // Email is now optional to support legacy users
  email?: string;

  // User is Mandatory
  mobile?: string;

  // Shareholder/Proxy is Mandatory
  nric?: string;
  nricRef?: InternalFile;
  accountVerificationStatus?: AccountVerificationStatusEnum;
  rejectMessage?: string;

  // Fallback contact information for users without email/phone
  fallbackContactName?: string; // Name of family member/caregiver
  fallbackContactPhone?: string; // Phone of family member/caregiver
  fallbackContactEmail?: string; // Email of family member/caregiver
  fallbackContactRelation?: string; // Relationship (e.g., "Son", "Daughter", "Caregiver")
  physicalAddress?: string; // Physical address for postal notifications
  requiresAssistedAccess?: boolean; // Indicates if user needs help accessing the system
  specialInstructions?: string; // Additional notes for admin/support staff
}
