import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Event, Resolution } from "@app/data/model";
import { EventRepository, VotingRepository } from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, Delete, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { AuditTypeEnum, RoleEnum } from "@vpoll-shared/enum";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";

@Controller("api/resolutions")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class ResolutionController {
  constructor(private eventRepo: EventRepository, private auditRepo: AuditRepository, private votingRepo: VotingRepository) {}

  @Post()
  @Bind(ApiContext(), Query("eventId"), Body())
  public async createResolution(context: Context, eventId: string, resolution: Resolution): Promise<Event> {
    const event = await this.eventRepo.get(eventId, { companyId: context.companyId });
    if (event.resolutions.find(r => r.index === resolution.index)) {
      throw new UserException({ message: "Duplicate resolution number" });
    }
    const updated = await this.eventRepo.addResolution({ _id: eventId, companyId: context.companyId }, resolution);
    await this.auditRepo.logEvent({
      _id: undefined,
      eventId: updated._id,
      userId: context.id,
      data: {
        type: AuditTypeEnum.EVENT,
        description: `Event ${updated.name} created resolution ${resolution.index}: ${resolution.title}`
      }
    });
    return updated;
  }

  @Patch(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async updateEventResolution(context: Context, eventId: string, resolutionId: string, resolution: Resolution): Promise<Event> {
    resolution._id = resolutionId;
    const updated = await this.eventRepo.updateResolution({ _id: eventId, companyId: context.companyId }, resolution);
    await this.auditRepo.logEvent({
      _id: undefined,
      eventId: updated._id,
      userId: context.id,
      data: {
        type: AuditTypeEnum.EVENT,
        description: `Event ${updated.name} updated resolution ${resolution.index}: ${resolution.title}`
      }
    });
    return updated;
  }

  @Delete()
  @Bind(ApiContext(), Query("eventId"))
  public async clearEventResolutions(context: Context, eventId: string): Promise<Event> {
    await this.validateBeforeDeleteResolution(eventId);
    return this.eventRepo.clearResolution({
      _id: eventId,
      companyId: context.companyId
    });
  }

  @Delete(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async deleteResolutionById(context: Context, eventId: string, resolutionId: string): Promise<Event> {
    await this.validateBeforeDeleteResolution(eventId);
    return this.eventRepo.deleteResolutionById({ _id: eventId, companyId: context.companyId }, resolutionId);
  }

  private async validateBeforeDeleteResolution(eventId: string) {
    const votingExisted = await this.votingRepo.getOneBy("eventId", eventId);
    if (votingExisted) {
      throw new UserException({ message: "Cannot delete resolution because voting is using the resolution" });
    }
  }
}
