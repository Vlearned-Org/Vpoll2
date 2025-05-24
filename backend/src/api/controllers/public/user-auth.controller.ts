import { EmailValidationDto, RequestResetPasswordWithEmailDto, ResetPasswordDto, UserLoginDto, UserSignUpDto } from "@app/api/dtos/user.dto";
import { AuthManager } from "@app/core/auth/managers/auth.manager";
import { PasswordManager } from "@app/core/auth/managers/password-manager";
import { RoleManager } from "@app/core/auth/managers/role.manager";
import { LocalAuthGuard } from "@app/core/auth/strategies/local.strategy";
import { StorageManager } from "@app/core/storage/storage.manager";
import { User } from "@app/data/model";
import { CompanyRepository, EventRepository, UserRepository } from "@app/data/repositories";
import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { LoginResponse, EmailValidationResponse, PublicEvent, RequestResetPasswordWithMobileResponse, RequestResetPasswordWithEmailResponse } from "@vpoll-shared/contract";
import { UserTokenEnum } from "@vpoll-shared/enum";
import { DataException } from "@vpoll-shared/errors/global-exception.filter";

@Controller("api")
export class UserAuthController {
  constructor(
    private userRepo: UserRepository,
    private auth: AuthManager,
    private password: PasswordManager,
    private roleManager: RoleManager,
    private eventRepo: EventRepository,
    private companyRepo: CompanyRepository,
    private storageManager: StorageManager
  ) {}

  @Get("upcoming-events")
  public async listUpcomingEvent(): Promise<Array<PublicEvent>> {
    const events = await this.eventRepo.all({ startAt: { $gte: new Date() } });
    const companies = await this.companyRepo.all({ _id: { $in: events.map(e => e.companyId) } });
    return Promise.all(
      events.map(async event => {
        const fileId = companies.find(comp => comp._id.toString() === event.companyId.toString()).information.logo as string;
        const partialUrl = fileId ? await this.storageManager.getPublicUrl(fileId.toString(), { company: event.companyId.toString() }) : null;
        return {
          companyId: event.companyId as string,
          eventId: event._id,
          name: event.name,
          description: event.description,
          startAt: event.startAt,
          endAt: event.endAt,
          noticeOfAgmUrl: event.noticeOfAgmUrl,
          annualReportUrl: event.annualReportUrl,
          logo: partialUrl ? `${process.env.API_URL}/api/storage/serve/${partialUrl}` : null
        };
      })
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  public async userVerification(@Request() req, @Body() body: UserLoginDto): Promise<LoginResponse> {
    return this.auth.userLogin(req.user, body);
  }


  @Post("refreshtoken")
  public async refreshtoken( @Body() body: User): Promise<LoginResponse> {
    
    return this.auth.refreshusertoken(body);
  }

  @Post("email-validation")
  public async signUpEmailValidation(@Body() body: EmailValidationDto): Promise<EmailValidationResponse> {
    return this.auth.userValidateEmail(body.email, body.isNewUser);
  }

  @Post("signup")
  public async verifyMobileAndCreateUser(@Body() body: UserSignUpDto): Promise<User> {
    if (body.password !== body.confirmPassword) {
      throw new DataException({ message: "Password and confirm password unmatch" });
    }
    return this.auth.validateOtpAndCreateUser(body);
  }

  @Post("request-change-password")
  public async requestPasswordReset(@Body() body: RequestResetPasswordWithEmailDto): Promise<RequestResetPasswordWithEmailResponse> {
    return this.password.requestChangePasswordWithEmail(body);
  }

  @Post("reset-password")
  public async resetUserPassword(@Body() body: ResetPasswordDto): Promise<LoginResponse> {
    if (body.password !== body.confirmPassword) {
      throw new DataException({ message: "Password and confirm password unmatch" });
    }
    return this.password.reset(body, UserTokenEnum.EMAIL);
  }
}
