import {
  AdminLoginDto as AdminLoginDtoContract,
  CreateCompanyAdminDto as CreateCompanyAdminDtoContract,
  MobileValidationDto as MobileValidationDtoContract,
  RequestResetPasswordWithEmailDto as RequestResetPasswordWithEmailDtoContract,
  RequestResetPasswordWithMobileDto as RequestResetPasswordWithMobileDtoContract,
  ResetPasswordDto as ResetPasswordDtoContract,
  UserLoginDto as UserLoginDtoContract,
  UserSignUpDto as UserSignUpDtoContract
} from "@vpoll-shared/contract";
import { AuthSourceEnum } from "@vpoll-shared/enum";
import { IsBoolean, IsEmail, IsEnum, IsMobilePhone, IsMongoId, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsString()
  public password: string;

  @IsBoolean()
  public rememberMe: boolean;

  @IsEnum(AuthSourceEnum)
  public source: AuthSourceEnum;
}

// Admin
export class AdminLoginDto extends LoginDto implements AdminLoginDtoContract {
  @IsEmail()
  public email: string;
}

export class RequestResetPasswordWithEmailDto implements RequestResetPasswordWithEmailDtoContract {
  @IsString()
  public email: string;
}

// User

export class UserLoginDto extends LoginDto implements UserLoginDtoContract {
  @IsString()
  public email: string;
}

export class RequestResetPasswordWithMobileDto implements RequestResetPasswordWithMobileDtoContract {
  @IsMobilePhone("ms-MY")
  public mobile: string;

  @IsString()
  public otp: string;
}

export class ResetPasswordDto implements ResetPasswordDtoContract {
  @IsString()
  public password: string;

  @IsString()
  public confirmPassword: string;

  @IsString()
  public token: string;
}

export class EmailValidationDto {
  @IsEmail()
  public email: string;

  @IsBoolean()
  public isNewUser: boolean;
}

export class MobileValidationDto implements MobileValidationDtoContract {
  @IsMobilePhone("ms-MY")
  public mobile: string;

  @IsBoolean()
  public isNewUser: boolean;
}

export class UserSignUpDto implements UserSignUpDtoContract {
  @IsEmail()
  public email: string;

  @IsOptional()
  @IsMobilePhone("ms-MY")
  public mobile?: string;

  @IsString()
  public name: string;

  @IsString()
  public nric: string;

  @IsOptional()
  @IsString()
  public otp?: string;

  @IsString()
  public password: string;

  @IsString()
  public confirmPassword: string;
}

export class CreateCompanyAdminDto implements CreateCompanyAdminDtoContract {
  @IsMongoId()
  @IsOptional()
  public companyId?: string;

  @IsEmail()
  public email: string;

  @IsString()
  public name: string;

  @IsString()
  @IsOptional()
  public password?: string;
}
