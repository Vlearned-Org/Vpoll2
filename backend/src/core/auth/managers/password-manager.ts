import { NotificationType } from "@app/core/notification/notification.enum";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginResponse, RequestResetPasswordWithEmailResponse, RequestResetPasswordWithMobileResponse } from "@vpoll-shared/contract";
import { UserTokenEnum } from "@vpoll-shared/enum";
import { RequestResetPasswordWithEmailDto, RequestResetPasswordWithMobileDto, ResetPasswordDto } from "src/api/dtos/user.dto";
import { NotificationManager } from "src/core/notification/notification.manager";
import { User } from "src/data/model";
import { UserRepository } from "src/data/repositories";
import { v1 as uuid } from "uuid";
import { PasswordUtils } from "./password.utils";
import SmsService from "./sms.manager";
import { TokensManager } from "./tokens.manager";
import moment = require("moment");

@Injectable()
export class PasswordManager {
  constructor(private user: UserRepository, private notification: NotificationManager, private tokens: TokensManager, private sms: SmsService) {}

  public async requestChangePasswordWithEmail(request: RequestResetPasswordWithEmailDto): Promise<RequestResetPasswordWithEmailResponse> {
    const { email } = request;

    const user = await this.user.getOneBy("email", email);
    if (!user) {
      throw new UnauthorizedException("User does not exist.", "request-password");
    }
    const token = await this.setResetPasswordToken(user._id, UserTokenEnum.EMAIL);
    await this.sendResetPasswordEmail(user, token);

    return { email: user.email };
  }

  public async requestChangePasswordWithMobile({ mobile, otp }: RequestResetPasswordWithMobileDto): Promise<RequestResetPasswordWithMobileResponse> {
    await this.sms.validatePhoneNumberOwnership(mobile, otp);

    const user = await this.user.getOneBy("mobile", mobile);
    if (!user) {
      throw new UnauthorizedException("User does not exist.", "request-password");
    }
    const token = await this.setResetPasswordToken(user._id, UserTokenEnum.MOBILE);

    return { token };
  }

  public async reset(request: ResetPasswordDto, tokenType: UserTokenEnum): Promise<LoginResponse> {
    const { password, token } = request;
    const { user, validatedToken: isTokenValidated, token: validatedToken } = await this.tokens.validate(token, tokenType);

    if (isTokenValidated) {
      const hashedPassword = await PasswordUtils.hash(password);
      await this.user.setPassword(user._id, hashedPassword);
      return this.updateResetPasswordTokens(user, validatedToken, tokenType);
    }

    return null;
  }

  private async setResetPasswordToken(userId: string, tokenType: UserTokenEnum): Promise<string> {
    const tokenExpiresAt = moment().add("1", "hours").toDate();
    const token = uuid();

    await this.user.setToken(tokenType, {
      userId,
      expiresAt: tokenExpiresAt,
      token: token
    });

    return token;
  }

  private async sendResetPasswordEmail(user: User, token: string) {
    await this.notification.process(user.email, NotificationType.simple, {
      subject: "Your password request",
      content: `Hello, <br /><br> You recently requested to reset your password for your Vpoll account.<br>Click the button below to reset it.
        <br /><br>
        <a style="padding:10px 15px; border-radius: 5px;background-color:#7B95A3;text-decoration:none;margin:10px auto;color:#fff;font-size:16px;" href="${process.env.APP_URL}/signin/reset-password?token=${token}">RESET NOW</a><br><br>
          Please change your password within 1 hour, or this link will become inactive.<br>
          You will have to request a new password after this delay.
        <br /> <br />If you did not request a password reset, please ignore this email.<br><br> Best regards. <br />BrioHR team.<br><br>
        <small>If you’re having trouble clicking the password reset button, please copy & paste this url in your browser:<br> ${process.env.APP_URL}/signin/reset-password?token=${token}</small>`
    });
  }

  private async updateResetPasswordTokens(user: User, emailToken: string, tokenType: UserTokenEnum): Promise<LoginResponse> {
    await this.user.revokeToken(tokenType, user._id);
    const jwtToken = await this.tokens.generateJwt(user);
    // TODO: need to handle the source here if it s from mobile.
    await this.tokens.generateRefreshToken(user._id);

    return {
      user,
      token: jwtToken
    };
  }
}
