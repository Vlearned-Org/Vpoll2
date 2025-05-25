import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from "@nestjs/common";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Bind } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";
import { LegacyUserRequestRepository } from "@app/data/repositories/legacy-user-request.repository";
import { UserRepository } from "@app/data/repositories/user.repository";
import { LegacyUserRequest, LegacyUserRequestStatus } from "@app/data/model/legacy-user-request.model";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";
import { UserStatusEnum } from "@vpoll-shared/enum";
import { AccountVerificationStatusEnum } from "@vpoll-shared/contract";
import { PasswordUtils } from "@app/core/auth/managers/password.utils";

interface ApproveRequestDto {
  adminNotes?: string;
  createUser?: boolean;
  userData?: {
    password?: string;
    email?: string;
    mobile?: string;
  };
  walkInCompleted?: boolean;
  visitNotes?: string;
}

interface RejectRequestDto {
  rejectionReason: string;
  adminNotes?: string;
}

@Controller("api/admin/legacy-user-requests")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole(RoleEnum.SYSTEM)
export class LegacyUserRequestController {
  constructor(
    private legacyUserRequestRepo: LegacyUserRequestRepository,
    private userRepo: UserRepository,
    private vpollNotifications: VpollNotifications
  ) {}

  @Get()
  @Bind(ApiContext(), Query("status"))
  public async getAllRequests(context: Context, status?: string): Promise<LegacyUserRequest[]> {
    const filters = status ? { status } : {};
    return this.legacyUserRequestRepo.findAll(filters);
  }

  @Get("stats")
  @Bind(ApiContext())
  public async getRequestStats(context: Context) {
    return this.legacyUserRequestRepo.getStats();
  }

  @Get("pending")
  @Bind(ApiContext())
  public async getPendingRequests(context: Context): Promise<LegacyUserRequest[]> {
    return this.legacyUserRequestRepo.findPending();
  }

  @Get(":id")
  @Bind(ApiContext(), Param("id"))
  public async getRequestById(context: Context, id: string): Promise<LegacyUserRequest> {
    return this.legacyUserRequestRepo.findById(id);
  }

  @Post(":id/approve")
  @Bind(ApiContext(), Param("id"), Body())
  public async approveRequest(
    context: Context, 
    id: string, 
    body: ApproveRequestDto
  ): Promise<LegacyUserRequest> {
    const request = await this.legacyUserRequestRepo.findById(id);
    if (!request) {
      throw new Error("Request not found");
    }

    // Approve the request
    const approvedRequest = await this.legacyUserRequestRepo.approve(
      id, 
      context.id, 
      body.adminNotes
    );

    // Create user if requested
    if (body.createUser) {
      try {
        const plainPassword = body.userData?.password || this.generateRandomPassword();
        const hashedPassword = await PasswordUtils.hash(plainPassword, true);
        
        const userData = {
          name: request.name,
          nric: request.nric,
          email: body.userData?.email || request.contactPersonEmail || `${request.nric.toLowerCase()}@noemail.local`,
          mobile: body.userData?.mobile || '',
          password: hashedPassword,
          isAdmin: false,
          status: UserStatusEnum.ACTIVE,
          accountVerificationStatus: AccountVerificationStatusEnum.APPROVED,
          fallbackContactName: request.contactPersonName,
          fallbackContactPhone: request.contactPersonPhone,
          fallbackContactEmail: request.contactPersonEmail,
          fallbackContactRelation: request.contactPersonRelation,
          physicalAddress: request.physicalAddress,
          requiresAssistedAccess: request.isWalkIn || request.preferredContactMethod === 'in_person',
          specialInstructions: this.buildSpecialInstructions(request, body)
        };

        const createdUser = await this.userRepo.createLegacyUser(userData);
        
        // Mark request as processed
        await this.legacyUserRequestRepo.markAsProcessed(id, createdUser._id);

        // Send notification based on contact method
        if (request.preferredContactMethod === 'in_person' || request.isWalkIn) {
          // For walk-in users, we'll handle communication differently
          console.log(`Walk-in user account created: ${createdUser.nric}`);
        } else if (request.contactPersonEmail || request.contactPersonPhone) {
          await this.sendApprovalNotification(request, createdUser, plainPassword);
        }

      } catch (error) {
        console.error("Failed to create user from approved request:", error);
        // Keep request as approved but don't mark as processed
      }
    }

    // Update walk-in status if applicable
    if (body.walkInCompleted && (request.isWalkIn || request.preferredContactMethod === 'in_person')) {
      await this.legacyUserRequestRepo.updateAdminNotes(
        id, 
        `${approvedRequest.adminNotes || ''}\n\nWalk-in visit completed. ${body.visitNotes || ''}`
      );
    }

    return approvedRequest;
  }

  private buildSpecialInstructions(request: LegacyUserRequest, body: ApproveRequestDto): string {
    let instructions = `Created from legacy user request ${request._id}. `;
    
    if (request.isWalkIn || request.preferredContactMethod === 'in_person') {
      instructions += `Walk-in account created. Visit location: ${request.visitLocation || 'Not specified'}. `;
      if (request.assistedBy) {
        instructions += `Accompanied by: ${request.assistedBy}. `;
      }
    }
    
    if (body.adminNotes) {
      instructions += body.adminNotes;
    }
    
    return instructions;
  }

  @Post(":id/reject")
  @Bind(ApiContext(), Param("id"), Body())
  public async rejectRequest(
    context: Context, 
    id: string, 
    body: RejectRequestDto
  ): Promise<LegacyUserRequest> {
    const request = await this.legacyUserRequestRepo.findById(id);
    if (!request) {
      throw new Error("Request not found");
    }

    const rejectedRequest = await this.legacyUserRequestRepo.reject(
      id, 
      context.id, 
      body.rejectionReason,
      body.adminNotes
    );

    // Send rejection notification if contact available
    if (request.contactPersonEmail || request.contactPersonPhone) {
      await this.sendRejectionNotification(request, body.rejectionReason);
    }

    return rejectedRequest;
  }

  @Patch(":id/notes")
  @Bind(ApiContext(), Param("id"), Body())
  public async updateAdminNotes(
    context: Context, 
    id: string, 
    body: { adminNotes: string }
  ): Promise<LegacyUserRequest> {
    return this.legacyUserRequestRepo.updateAdminNotes(id, body.adminNotes);
  }

  @Delete(":id")
  @Bind(ApiContext(), Param("id"))
  public async deleteRequest(context: Context, id: string): Promise<{ success: boolean }> {
    const success = await this.legacyUserRequestRepo.deleteById(id);
    return { success };
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async sendApprovalNotification(request: LegacyUserRequest, user: any, password: string) {
    const subject = "VPoll Account Created - Legacy User Request Approved";
    const message = `
      Good news! Your VPoll account request has been approved.
      
      Account Details:
      - Name: ${request.name}
      - NRIC: ${request.nric}
      - Login Username: ${user.nric || user.email}
      - Temporary Password: ${password}
      
      Next Steps:
      1. Visit the VPoll login page
      2. Use your NRIC or email as username
      3. Use the temporary password provided above
      4. Change your password after first login
      
      If you need assistance accessing your account, please contact our support team.
      
      Thank you for using VPoll.
    `;

    try {
      await this.vpollNotifications.onUserEnquiry(
        request.contactPersonEmail || 'admin@vpoll.com',
        {
          name: request.contactPersonName || request.name,
          email: request.contactPersonEmail || '',
          phone: request.contactPersonPhone || '',
          companyname: 'VPoll System',
          subject,
          message
        }
      );
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  }

  private async sendRejectionNotification(request: LegacyUserRequest, reason: string) {
    const subject = "VPoll Account Request - Additional Information Required";
    const message = `
      Thank you for your VPoll account request. We need some additional information before we can proceed.
      
      Request Details:
      - Name: ${request.name}
      - NRIC: ${request.nric}
      - Request Type: ${request.requestType.replace('_', ' ').toUpperCase()}
      ${request.isWalkIn ? `- Visit Type: Walk-in appointment` : ''}
      ${request.visitLocation ? `- Preferred Location: ${request.visitLocation}` : ''}
      
      Reason for Additional Review:
      ${reason}
      
      What to do next:
      ${request.isWalkIn 
        ? 'Please visit our office during business hours with your identification documents, or contact our support team for assistance.'
        : 'Please contact our support team or submit a new request with the additional information requested above.'
      }
      
      We apologize for any inconvenience and appreciate your patience.
      
      VPoll Support Team
    `;

    try {
      await this.vpollNotifications.onUserEnquiry(
        request.contactPersonEmail || 'admin@vpoll.com',
        {
          name: request.contactPersonName || request.name,
          email: request.contactPersonEmail || '',
          phone: request.contactPersonPhone || '',
          companyname: 'VPoll System',
          subject,
          message
        }
      );
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }
  }
}