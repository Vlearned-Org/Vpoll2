import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginResponse, MobileValidationResponse } from "@vpoll-shared/contract";
import { AdminLoginDto, LoginDto, UserLoginDto } from "src/api/dtos/user.dto";
import { User } from "src/data/model/user.model";
import { UserRepository } from "src/data/repositories";
import { MobileExistedException, UserNotFoundException } from "../exceptions/create-user.exception";
import { FailedLoginException } from "../exceptions/failed-login.exception";
import { PasswordUtils } from "./password.utils";
import { RoleManager } from "./role.manager";
import SmsService from "./sms.manager";
import { TokensManager } from "./tokens.manager";

@Injectable()
export class AuthManager {
  // Create and Validate User
  constructor(private userRepo: UserRepository, private tokensManager: TokensManager, private sms: SmsService, private roleManager: RoleManager) {}

  // Admin
  public async adminValidate(email: string, password: string): Promise<User> {
    const user = await this.userRepo.getOneBy("email", email);

    if (!user) {
      throw new FailedLoginException({
        message: "Login email not found",
        metadata: {
          email: email
        }
      });
    }

    if (!(await PasswordUtils.check(password, user.password))) {
      throw new FailedLoginException({
        message: "Login wrong password",
        metadata: {
          email: email
        }
      });
    }
    return user;
  }

  public async adminLogin(user: User, loginBody: AdminLoginDto): Promise<LoginResponse> {
    return this.login(user, loginBody);
  }

  // User
  public async userValidateMobile(mobile: string, isNewUser: boolean): Promise<MobileValidationResponse> {
    const user = await this.userRepo.getOneBy("mobile", mobile);
    if (isNewUser && user) {
      throw new MobileExistedException({ message: "This mobile number is associated with one of the user. To login please go to login page." });
    }
    if (!isNewUser && !user) {
      throw new UserNotFoundException({
        message: "This mobile number is not registered with any associated user. To register as new user please go to register page."
      });
    }
    await this.sms.initiatePhoneNumberVerification(mobile);
    return { mobile };
  }

  public async validateOtpAndCreateUser(mobile: string,email: string, name: string,nric: string, otp: string, password: string): Promise<User> {
    await this.sms.validatePhoneNumberOwnership(mobile, otp);

    const mobileUser = await this.userRepo.getOneBy("mobile", mobile);
    if (mobileUser) {
      throw new MobileExistedException();
    }
    const hashedPassword = await PasswordUtils.hash(password);
    const user = await this.userRepo.createBasicUser(mobile,email,name,nric, hashedPassword);

    return user;
  }

  public async userValidate(mobile: string, password: string): Promise<User> {
    const user = await this.userRepo.getOneBy("mobile", mobile);

    if (!user) {
      throw new FailedLoginException({
        message: "Login mobile not found",
        metadata: {
          mobile: mobile
        }
      });
    }

    if (!(await PasswordUtils.check(password, user.password))) {
      throw new FailedLoginException({
        message: "Login wrong password",
        metadata: {
          mobile: mobile
        }
      });
    }
    return user;
  }

  public async userLogin(user: User, loginBody: UserLoginDto): Promise<LoginResponse> {
    return this.login(user, loginBody);
  }

  public async refreshusertoken(user: User): Promise<LoginResponse> {

    console.log(user);
    if (!user) {
      throw new UnauthorizedException();
    }

    let _user: User;
    if (!user.isAdmin) {
      const roles = await this.roleManager.generateRoles(user);
      _user = await this.userRepo.updateRoles(user._id, roles);
    } else {
      _user = user;
    }
    await Promise.all([
      this.tokensManager.generateRefreshToken(_user._id, true, "web" as any),
      this.userRepo.setLoginAt(_user._id)
    ]);

    return { user: _user, token: await this.tokensManager.generateJwt(_user) };
  }

  private async login(user: User, loginBody: LoginDto): Promise<LoginResponse> {
    if (!user) {
      throw new UnauthorizedException();
    }
    let _user: User;
    if (!user.isAdmin) {
      const roles = await this.roleManager.generateRoles(user);
      _user = await this.userRepo.updateRoles(user._id, roles);
    } else {
      _user = user;
    }

    await Promise.all([
      this.tokensManager.generateRefreshToken(_user._id, loginBody.rememberMe, loginBody.source as any),
      this.userRepo.setLoginAt(_user._id)
    ]);

    return { user: _user, token: await this.tokensManager.generateJwt(_user) };
  }
}
