import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Corporate } from "@app/data/model";
import { UserAuditData } from "@app/data/model/audit.model";
import { CorporateRepository } from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AddCorporate, Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";
import { EventRepository } from "@app/data/repositories";

@Controller("api/corporates")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class CorporateController {
  constructor(private corporateRepo: CorporateRepository, private auditRepo: AuditRepository,
    private notif: VpollNotifications,
    private eventRepo: EventRepository,) {}

  @Get()
  @Bind(ApiContext(), Query("eventId"))
  public async listCorporate(context: Context, eventId: string): Promise<Array<Corporate>> {
    return this.corporateRepo.all({ eventId, companyId: context.companyId }, { lean: true });
  }

  @Get(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async getCorporateById(context: Context, eventId: string, corporateId: string): Promise<Corporate> {
    return this.corporateRepo.get(corporateId, {
      eventId,
      companyId: context.companyId
    });
  }

  @Post()
  @Bind(ApiContext(), Query("eventId"), Body())
  public async createEventCorporate(context: Context, eventId: string, corporate: AddCorporate): Promise<Corporate> {
    const created = await this.corporateRepo.create({ ...corporate, companyId: context.companyId, eventId, _id: undefined });
    const event = await this.eventRepo.get(eventId)
    
    await this.notif.onInvite(corporate.email, {name:corporate.name,event:event.name,date:event.startAt});   
    
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
  public async updateEventCorporate(context: Context, eventId: string, corporateId: string, corporate: AddCorporate): Promise<Corporate> {
    const updated = await this.corporateRepo.update(
      corporateId,
      { ...corporate, companyId: context.companyId, eventId, _id: corporateId },
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
    
    await this.notif.onInvite(corporate.email, {name:corporate.name,event:event.name,date:event.startAt});   
    return updated;
  }

  @Delete(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async deleteCorporateById(context: Context, eventId: string, corporateId: string): Promise<Corporate> {
    const deleted = await this.corporateRepo.delete(corporateId, {
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
