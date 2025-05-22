import { RoleEnum, UserStatusEnum } from "@vpoll-shared/enum";
import { Company } from "./company.interface";
import { Event } from "./event.interface";
import { AccountVerificationStatusEnum } from "./user.interface";
export interface Context {
    companyId: string;
    isAdmin: boolean;
    name: string;
    role: RoleEnum;
    id: string;
    roles: Array<Role>;
}
export interface Role {
    role: RoleEnum;
    companyId?: Company | string;
    eventId?: Event | string;
    refId?: string;
}
export interface JwtToken<T> {
    id: string;
    isAdmin: boolean;
    status: UserStatusEnum;
    roles: Array<Role>;
    name: string;
    personalInfo: T;
}
export interface AdminJwtToken extends JwtToken<{
    email: string;
}> {
}
export interface UserJwtToken extends JwtToken<{
    mobile: string;
    nric: string;
    accountVerificationStatus: AccountVerificationStatusEnum;
    rejectMessage: string;
}> {
}
