import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";
import { PasswordUtils } from "@app/core/auth/managers/password.utils";
import { Bind, Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Context, AccountVerificationStatusEnum } from "@vpoll-shared/contract";
import { RoleEnum, UserStatusEnum } from "@vpoll-shared/enum";
import { UserRepository } from "src/data/repositories";
import { v4 as uuid } from "uuid";
import moment = require("moment");

@Controller("api/users")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole(RoleEnum.SYSTEM)
export class UsersController {
  constructor(private userRepo: UserRepository, private notif: VpollNotifications) {}

  @Get()
  @Bind(ApiContext(), Query("status"))
  public async listUsers(context: Context, status: UserStatusEnum) {
    return this.userRepo.listNonAdminUsers(status);
  }

  @Get(":id")
  @Bind(ApiContext(), Param("id"))
  public async getUserById(context: Context, id: string) {
    return this.userRepo.get(id);
  }

  @Patch(":id/approve")
  @Bind(ApiContext(), Param("id"))
  public async activateUser(context: Context, id: string) {
    const result = await this.userRepo.approveUser(id);
    await this.notif.onUserApproved(result.email, {});
    return result;
  }

  @Patch(":id/reject")
  @Bind(ApiContext(), Param("id"), Body())
  public async deactivateUser(context: Context, id: string, payload: { reason: string }) {
    const result = await this.userRepo.rejectUser(id, payload.reason);
    await this.notif.onUserReject(result.email, { reason: result.rejectMessage });
    return result;
  }
}

@Controller("api/admin/legacy-users")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole(RoleEnum.SYSTEM)
export class LegacyUsersController {
  constructor(private userRepo: UserRepository, private notif: VpollNotifications) {}

  @Get()
  @Bind(ApiContext())
  public async listLegacyUsers(context: Context) {
    // Return users who have limited contact information or are marked as legacy
    return this.userRepo.listLegacyUsers();
  }

  @Post()
  @Bind(ApiContext(), Body())
  public async createLegacyUser(context: Context, payload: {
    name: string;
    nric: string;
    password: string;
    email?: string;
    mobile?: string;
    fallbackContactName?: string;
    fallbackContactPhone?: string;
    fallbackContactEmail?: string;
    fallbackContactRelation?: string;
    physicalAddress?: string;
    requiresAssistedAccess?: boolean;
    specialInstructions?: string;
    isAdmin: boolean;
    status: string;
    accountVerificationStatus: string;
  }) {
    const hashedPassword = await PasswordUtils.hash(payload.password, true);
    
    const userData = {
      ...payload,
      password: hashedPassword,
      accountVerificationStatus: AccountVerificationStatusEnum.APPROVED,
      status: UserStatusEnum.ACTIVE,
      isLegacyUser: true
    };

    return this.userRepo.createLegacyUser(userData);
  }

  @Patch(":id")
  @Bind(ApiContext(), Param("id"), Body())
  public async updateLegacyUser(context: Context, id: string, payload: any) {
    return this.userRepo.updateLegacyUser(id, payload);
  }

  @Post(":id/reset-password")
  @Bind(ApiContext(), Param("id"))
  public async resetUserPassword(context: Context, id: string) {
    const newPassword = this.generateRandomPassword();
    const hashedPassword = await PasswordUtils.hash(newPassword, true);
    
    await this.userRepo.setPassword(id, hashedPassword);
    
    return { newPassword };
  }

  @Post(":id/access-code")
  @Bind(ApiContext(), Param("id"))
  public async generateAccessCode(context: Context, id: string) {
    const accessCode = uuid().substring(0, 8).toUpperCase();
    const expiresAt = moment().add(24, 'hours').toDate();
    
    await this.userRepo.setAccessCode(id, accessCode, expiresAt);
    
    return { accessCode, expiresAt: expiresAt.toISOString() };
  }

  @Post(":id/notify-fallback")
  @Bind(ApiContext(), Param("id"))
  public async sendNotificationToFallback(context: Context, id: string) {
    const user = await this.userRepo.get(id);
    
    if (user.fallbackContactEmail) {
      await this.notif.sendFallbackNotification(user.fallbackContactEmail, {
        userName: user.name,
        fallbackContactName: user.fallbackContactName
      });
    }
    
    return { message: "Notification sent successfully" };
  }

  @Post(":id/mark-as-legacy")
  @Bind(ApiContext(), Param("id"))
  public async markAsLegacyUser(context: Context, id: string) {
    return this.userRepo.markAsLegacyUser(id);
  }

  @Post(":id/unmark-legacy")
  @Bind(ApiContext(), Param("id"))
  public async unmarkLegacyUser(context: Context, id: string) {
    return this.userRepo.unmarkLegacyUser(id);
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one character from each required type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase  
    password += "0123456789"[Math.floor(Math.random() * 10)]; // number
    
    // Fill the rest randomly
    for (let i = 3; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}
