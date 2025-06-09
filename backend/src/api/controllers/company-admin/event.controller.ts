import { VotingCalculator } from "@app/core/voting/voting-calculator.utils";
import { Audit, AuditData, QuestionAuditData } from "@app/data/model/audit.model";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { AuditTypeEnum, RoleEnum } from "@vpoll-shared/enum";
import { HasRole } from "src/api/security/decorators/has-role.decorator";
import { RoleGuard } from "src/api/security/guards/role.guard";
import { JwtAuthGuard } from "src/core/auth/strategies/jwt.strategy";
import { ApiContext } from "src/core/context/api-context-param.decorator";
import { Event } from "src/data/model";
import { EventRepository, VotingRepository, UserRepository } from "src/data/repositories";
import { PasswordConfirmationDto } from "src/api/dtos/event.dto";
import { PasswordUtils } from "src/core/auth/managers/password.utils";

@Controller("api/events")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class EventController {
  constructor(
    private eventRepo: EventRepository, 
    private auditRepo: AuditRepository, 
    private votingRepo: VotingRepository,
    private userRepo: UserRepository
  ) {}

  @Get()
  @Bind(ApiContext())
  public async listEvents(context: Context): Promise<Array<Event>> {
    return this.eventRepo.all({ companyId: context.companyId, isDeleted: false });
  }

  @Get(":id/audit-logs/questions")
  @Bind(ApiContext(), Param("id"))
  public async getEventQuestionLogsById(context: Context, eventId: string): Promise<Audit<QuestionAuditData>[]> {
    return this.auditRepo.all({ eventId, "data.type": AuditTypeEnum.QUESTION }, { sort: { createdAt: -1 } }) as any;
  }

  @Get(":id/audit-logs")
  @Bind(ApiContext(), Param("id"))
  public async getEventAuditLogsById(context: Context, eventId: string): Promise<Audit<AuditData>[]> {
    return this.auditRepo.all({ eventId });
  }

  @Get(":id/voting-result")
  @Bind(ApiContext(), Param("id"))
  public async getEventProxyVotingResult(context: Context, eventId: string) {
    const event = await this.eventRepo.get(eventId);

    const votings = await this.votingRepo.all({
      companyId: context.companyId,
      eventId
    });
    const shareholderCds = new Set(
      votings.filter(item => item.voterType === 'SHAREHOLDER').map(item => item.cds)
    );

    const filteredData = votings.filter(item => {
      if (item.voterType === 'PROXY') {
        return !shareholderCds.has(item.cds);
      }
      return true;
    });
    return VotingCalculator.calculate(filteredData, event.resolutions);
  }

  @Get(":id")
  @Bind(ApiContext(), Param("id"))
  public async getEventById(context: Context, eventId: string): Promise<Event> {
    return this.eventRepo.get(eventId);
  }

  @Post()
  @Bind(ApiContext(), Body())
  public async createEvent(context: Context, event: Event): Promise<Event> {
    event.companyId = context.companyId;
    const created = await this.eventRepo.create(event);
    await this.auditRepo.logEvent({
      _id: undefined,
      eventId: created._id,
      userId: context.id,
      data: {
        type: AuditTypeEnum.EVENT,
        description: `Event ${created.name} created`
      }
    });
    return created;
  }

  @Patch(":id")
  @Bind(ApiContext(), Param("id"), Body())
  public async updateEvent(context: Context, eventId: string, event: Event): Promise<Event> {
    event._id = eventId;
    event.companyId = context.companyId;
    return this.eventRepo.update(event._id, event);
  }

  @Patch(":id/start-polling")
  @Bind(ApiContext(), Param("id"), Body())
  public async startEventPolling(context: Context, eventId: string, passwordDto: PasswordConfirmationDto): Promise<Event> {
    // Verify admin password
    const user = await this.userRepo.get(context.id);
    if (!user || !(await PasswordUtils.check(passwordDto.password, user.password))) {
      throw new ForbiddenException("Invalid password");
    }

    const updated = await this.eventRepo.startPolling(eventId, context.companyId);
    await this.auditRepo.logEvent({
      _id: undefined,
      eventId: updated._id,
      userId: context.id,
      data: {
        type: AuditTypeEnum.EVENT,
        description: `Event ${updated.name} polling started`
      }
    });
    return updated;
  }

  @Patch(":id/end-polling")
  @Bind(ApiContext(), Param("id"), Body())
  public async endEventPolling(context: Context, eventId: string, passwordDto: PasswordConfirmationDto): Promise<Event> {
    // Verify admin password
    const user = await this.userRepo.get(context.id);
    if (!user || !(await PasswordUtils.check(passwordDto.password, user.password))) {
      throw new ForbiddenException("Invalid password");
    }

    const updated = await this.eventRepo.endPolling(eventId, context.companyId);
    await this.auditRepo.logEvent({
      _id: undefined,
      eventId: updated._id,
      userId: context.id,
      data: {
        type: AuditTypeEnum.EVENT,
        description: `Event ${updated.name} polling ended`
      }
    });
    return updated;
  }

  @Patch(":id/publish-polling")
  @Bind(ApiContext(), Param("id"))
  public async publishEventPolling(context: Context, eventId: string): Promise<Event> {
    const updated = await this.eventRepo.publishPolling(eventId, context.companyId);
    await this.auditRepo.logEvent({
      _id: undefined,
      eventId: updated._id,
      userId: context.id,
      data: {
        type: AuditTypeEnum.EVENT,
        description: `Event ${updated.name} polling published`
      }
    });
    return updated;
  }

  @Delete(":id")
  @Bind(ApiContext(), Param("id"))
  public async softDeleteEvent(context: Context, eventId: string): Promise<Event> {
    return this.eventRepo.softDeleteEvent(eventId, context.companyId);
  }

  @Get(":id/reports")
  @Bind(ApiContext(), Param("id"))
  public async getReport(context: Context, eventId: string) {}
}
