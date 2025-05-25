import { EmailValidationDto, RequestResetPasswordWithEmailDto, ResetPasswordDto, UserLoginDto, UserSignUpDto } from "@app/api/dtos/user.dto";
import { AuthManager } from "@app/core/auth/managers/auth.manager";
import { PasswordManager } from "@app/core/auth/managers/password-manager";
import { RoleManager } from "@app/core/auth/managers/role.manager";
import { LocalAuthGuard } from "@app/core/auth/strategies/local.strategy";
import { StorageManager } from "@app/core/storage/storage.manager";
import { User } from "@app/data/model";
import { CompanyRepository, EventRepository, UserRepository } from "@app/data/repositories";
import { LegacyUserRequestRepository } from "@app/data/repositories/legacy-user-request.repository";
import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { LoginResponse, EmailValidationResponse, PublicEvent, RequestResetPasswordWithMobileResponse, RequestResetPasswordWithEmailResponse } from "@vpoll-shared/contract";
import { UserTokenEnum } from "@vpoll-shared/enum";
import { DataException } from "@vpoll-shared/errors/global-exception.filter";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";

export interface LegacyUserRequestDto {
  name: string;
  nric: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  contactPersonRelation?: string;
  physicalAddress?: string;
  preferredContactMethod: 'phone' | 'email' | 'postal' | 'in_person';
  requestType: 'new_account' | 'password_reset' | 'access_help' | 'walk_in_account' | 'other';
  message: string;
  eventName?: string;
  visitLocation?: string;
  visitDate?: string;
  assistedBy?: string;
  isWalkIn?: boolean;
}

@Controller("api")
export class UserAuthController {
  constructor(
    private userRepo: UserRepository,
    private storage: StorageManager,
    private auth: AuthManager,
    private password: PasswordManager,
    private role: RoleManager,
    private eventRepo: EventRepository,
    private companyRepo: CompanyRepository,
    private vpollNotifications: VpollNotifications,
    private legacyUserRequestRepo: LegacyUserRequestRepository
  ) {}

  @Get("upcoming-events")
  public async listUpcomingEvent(): Promise<Array<PublicEvent>> {
    const events = await this.eventRepo.all({ startAt: { $gte: new Date() } });
    const companies = await this.companyRepo.all({ _id: { $in: events.map(e => e.companyId) } });
    return Promise.all(
      events.map(async event => {
        const fileId = companies.find(comp => comp._id.toString() === event.companyId.toString()).information.logo as string;
        const partialUrl = fileId ? await this.storage.getPublicUrl(fileId.toString(), { company: event.companyId.toString() }) : null;
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

  @Post("legacy-user-request")
  public async submitLegacyUserRequest(@Body() body: LegacyUserRequestDto): Promise<{ message: string }> {
    // Save the request to database
    const savedRequest = await this.legacyUserRequestRepo.create({
      name: body.name,
      nric: body.nric,
      contactPersonName: body.contactPersonName,
      contactPersonPhone: body.contactPersonPhone,
      contactPersonEmail: body.contactPersonEmail,
      contactPersonRelation: body.contactPersonRelation,
      physicalAddress: body.physicalAddress,
      preferredContactMethod: body.preferredContactMethod as any,
      requestType: body.requestType as any,
      message: body.message,
      eventName: body.eventName,
      visitLocation: body.visitLocation,
      visitDate: body.visitDate ? new Date(body.visitDate) : undefined,
      assistedBy: body.assistedBy,
      isWalkIn: body.isWalkIn || false
    });

    // Send notification to admin team with the legacy user request
    const adminEmailSubject = `Legacy User Request: ${body.requestType.replace('_', ' ').toUpperCase()}`;
    const adminEmailBody = `
      A legacy user has submitted a request for assistance.
      
      Request ID: ${savedRequest.toString()}
      
      User Information:
      - Name: ${body.name}
      - NRIC: ${body.nric}
      - Request Type: ${body.requestType.replace('_', ' ').toUpperCase()}
      - Event Name: ${body.eventName || 'Not specified'}
      
      Contact Information:
      - Preferred Contact Method: ${body.preferredContactMethod.toUpperCase()}
      ${body.contactPersonName ? `- Contact Person: ${body.contactPersonName} (${body.contactPersonRelation || 'Relationship not specified'})` : ''}
      ${body.contactPersonPhone ? `- Contact Phone: ${body.contactPersonPhone}` : ''}
      ${body.contactPersonEmail ? `- Contact Email: ${body.contactPersonEmail}` : ''}
      ${body.physicalAddress ? `- Physical Address: ${body.physicalAddress}` : ''}
      
      IMPORTANT: All OTP and authentication processes will be conducted via EMAIL only.
      If phone is the preferred contact method, use it for initial contact but send all OTP/verification via the provided email.
      
      Message:
      ${body.message}
      
      Please log into the admin panel to review and process this request.
      
      This is an automated message from the VPoll system.
    `;

    try {
      // Use existing onUserEnquiry method to send to admin
      await this.vpollNotifications.onUserEnquiry(process.env.ADMIN_EMAIL || 'admin@vpoll.com', {
        name: body.name,
        email: body.contactPersonEmail || 'No email provided',
        phone: body.contactPersonPhone || 'No phone provided',
        companyname: 'Legacy User Request',
        subject: adminEmailSubject,
        message: adminEmailBody
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      // Continue execution even if email fails
    }

    return { message: "Legacy user request submitted successfully. Admin team will contact you within 2 business days." };
  }
}
