export enum RoleEnum {
  SYSTEM = "system",
  COMPANY_SYSTEM = "company-system",
  COMPANY_ADMIN = "company-admin",
  CHAIRMAN = "chairman",
  SHAREHOLDER = "shareholder",
  PROXY = "proxy",
  INVITEE = "invitee",
  CORPORATE = "corporate",
}

export enum AuthSourceEnum {
  web = "web",
  mobile = "mobile",
}

export enum UserTokenEnum {
  EMAIL = "email",
  WEB = "web",
  MOBILE = "mobile",
}

export enum UserStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum IdentityTypeEnum {
  NRIC = "nric",
  PASSPORT = "passport",
}
