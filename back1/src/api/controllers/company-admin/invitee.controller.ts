import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Invitee } from "@app/data/model";
import { UserAuditData } from "@app/data/model/audit.model";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";
import { InviteeRepository } from "@app/data/repositories";
import { EventRepository } from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AddInvitee, Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";

@Controller("api/invitees")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class InviteeController {
  constructor(private inviteeRepo: InviteeRepository,
    private auditRepo: AuditRepository,
    private notif: VpollNotifications,
    private eventRepo: EventRepository,) {}

  @Get()
  @Bind(ApiContext(), Query("eventId"))
  public async listInvitee(context: Context, eventId: string): Promise<Array<Invitee>> {
    return this.inviteeRepo.all({ eventId, companyId: context.companyId }, { lean: true });
  }

  @Get(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async getInviteeById(context: Context, eventId: string, inviteeId: string): Promise<Invitee> {
    return this.inviteeRepo.get(inviteeId, {
      eventId,
      companyId: context.companyId
    });
  }

  @Post()
  @Bind(ApiContext(), Query("eventId"), Body())
  public async createEventInvitee(context: Context, eventId: string, invitee: AddInvitee): Promise<Invitee> {
    const created = await this.inviteeRepo.create({ ...invitee, companyId: context.companyId, eventId, _id: undefined });
    const event = await this.eventRepo.get(eventId)
    
    await this.notif.onInvite(invitee.email, {name:invitee.name,event:event.name,date:event.startAt});
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("added", {
          role: RoleEnum.INVITEE,
          ref: created._id,
          name: created.name
        })
      }
    ]);
    return created;
  }

  @Patch(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async updateEventInvitee(context: Context, eventId: string, inviteeId: string, invitee: AddInvitee): Promise<Invitee> {
    const updated = await this.inviteeRepo.update(
      inviteeId,
      { ...invitee, companyId: context.companyId, eventId, _id: inviteeId },
      {
        eventId,
        companyId: context.companyId
      }
    );
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("updated", {
          role: RoleEnum.INVITEE,
          ref: updated._id,
          name: updated.name
        })
      }
    ]);

    const event = await this.eventRepo.get(eventId)
    
    await this.notif.onInvite(invitee.email, {name:invitee.name,event:event.name,date:event.startAt});
    return updated;
  }

  @Delete(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async deleteInviteeById(context: Context, eventId: string, inviteeId: string): Promise<Invitee> {
    const deleted = await this.inviteeRepo.delete(inviteeId, {
      _id: eventId,
      companyId: context.companyId
    });
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("deleted", {
          role: RoleEnum.INVITEE,
          ref: deleted._id,
          name: deleted.name
        })
      }
    ]);
    return deleted;
  }
}
