import { AuthSourceEnum } from "@vpoll-shared/enum";
import { User } from "./user.interface";

export interface LoginDto {
  password: string;
  rememberMe: boolean;
  source: AuthSourceEnum;
}

export interface AdminLoginDto extends LoginDto {
  email: string;
}

export interface UserLoginDto extends LoginDto {
  mobile: string;
}
export interface LoginResponse {
  user: User;
  token: string;
}

export interface UserSignUpDto {
  mobile: string;
  otp: string;
  password: string;
}

export interface RequestResetPasswordWithEmailDto {
  email: string;
}

export interface RequestResetPasswordWithEmailResponse {
  email: string;
}

export interface RequestResetPasswordWithMobileDto {
  mobile: string;
  otp: string;
}

export interface RequestResetPasswordWithMobileResponse {
  token: string;
}

export interface ResetPasswordDto {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ResetPasswordResponse {
  email: string;
  tokens: object;
}

export interface MobileValidationDto {
  mobile: string;
  isNewUser: boolean;
}

export interface MobileValidationResponse {
  mobile: string;
}

export interface UserSignUpDto {
  mobile: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

export interface CreateCompanyAdminDto {
  name: string;
  email: string;
  companyId?: string;
  password?: string;
}
