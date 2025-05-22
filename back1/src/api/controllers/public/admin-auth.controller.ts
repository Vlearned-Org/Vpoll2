import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { LoginResponse, RequestResetPasswordWithEmailResponse } from "@vpoll-shared/contract";
import { UserTokenEnum } from "@vpoll-shared/enum";
import { DataException } from "@vpoll-shared/errors/global-exception.filter";
import { AuthManager } from "src/core/auth/managers/auth.manager";
import { PasswordManager } from "src/core/auth/managers/password-manager";
import { LocalAuthGuard } from "src/core/auth/strategies/local.strategy";
import { AdminLoginDto, RequestResetPasswordWithEmailDto, ResetPasswordDto } from "../../dtos/user.dto";

@Controller("api/admin")
export class AdminAuthController {
  constructor(private auth: AuthManager, private password: PasswordManager) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  public async login(@Request() req, @Body() body: AdminLoginDto): Promise<LoginResponse> {
    return this.auth.adminLogin(req.user, body);
  }

  @Post("request-password")
  public async requestPassword(@Body() body: RequestResetPasswordWithEmailDto): Promise<RequestResetPasswordWithEmailResponse> {
    return this.password.requestChangePasswordWithEmail(body);
  }

  @Post("reset-password")
  public async resetPassword(@Body() body: ResetPasswordDto): Promise<LoginResponse> {
    if (body.password !== body.confirmPassword) {
      throw new DataException({ message: "Password and confirm password unmatch" });
    }
    return this.password.reset(body, UserTokenEnum.EMAIL);
  }
}
