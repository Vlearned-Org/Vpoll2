import { Injectable, UnauthorizedException } from "@nestjs/common";
import { EmailValidationResponse, LoginResponse, UserSignUpDto } from "@vpoll-shared/contract";
import { AdminLoginDto, LoginDto, UserLoginDto } from "src/api/dtos/user.dto";
import { User } from "src/data/model/user.model";
import { UserRepository } from "src/data/repositories";
import { VpollNotifications } from "../../notification/vpoll.notification";
import { MobileExistedException, UserNotFoundException } from "../exceptions/create-user.exception";
import { FailedLoginException } from "../exceptions/failed-login.exception";
import { PasswordUtils } from "./password.utils";
import { RoleManager } from "./role.manager";
import { TokensManager } from "./tokens.manager";
import { EmailService } from './email.manager';

@Injectable()
export class AuthManager {
  // Create and Validate User
  constructor(
    private userRepo: UserRepository, 
    private tokensManager: TokensManager, 
    private emailService: EmailService,
    private roleManager: RoleManager,
    private vpollNotifications: VpollNotifications
  ) {}

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
  public async userValidateEmail(email: string, isNewUser: boolean): Promise<EmailValidationResponse> {
    const user = await this.userRepo.getOneBy("email", email);
    if (isNewUser && user) {
      throw new MobileExistedException({ message: "This email address is associated with one of the user. To login please go to login page." });
    }
    if (!isNewUser && !user) {
      throw new UserNotFoundException({
        message: "This email address is not registered with any associated user. To register as new user please go to register page."
      });
    }
    await this.emailService.initiateEmailVerification(email);
    return { email };
  }

  public async validateOtpAndCreateUser(payload: UserSignUpDto): Promise<User> {
    await this.emailService.validateEmailOwnership(payload.email, payload.otp);

    const emailUser = await this.userRepo.getOneBy("email", payload.email);
    if (emailUser) {
      throw new MobileExistedException({message: "This email is already registered."} );
    }
    const hashedPassword = await PasswordUtils.hash(payload.password);
    const user = await this.userRepo.createBasicUser(payload.email, hashedPassword, payload.name, payload.nric, payload.mobile);

    // Send welcome email
    await this.vpollNotifications.onUserSignedUp(user.email, { name: user.name });

    return user;
  }

  public async userValidate(email: string, password: string): Promise<User> {
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
