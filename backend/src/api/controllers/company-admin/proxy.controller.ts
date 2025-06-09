import { AddProxyDto, AddProxyVotingDto, EditProxyVotingDto } from "@app/api/dtos/proxy.dto";
import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { ProxyManager } from "@app/core/voting/proxy.manager";
import { VotingCalculator } from "@app/core/voting/voting-calculator.utils";
import { VotingManager } from "@app/core/voting/voting.manager";
import { Proxy, Voting } from "@app/data/model";
import { UserAuditData } from "@app/data/model/audit.model";
import { EventRepository, ProxyRepository, VotingRepository } from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum, VoterTypeEnum } from "@vpoll-shared/enum";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";

@Controller("api/proxies")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class ProxyController {
  constructor(
    private proxyRepo: ProxyRepository,
    private votingRepo: VotingRepository,
    private eventRepo: EventRepository,
    private auditRepo: AuditRepository,
    private proxyManager: ProxyManager,
    private votingManager: VotingManager
  ) {}

  @Get()
  @Bind(ApiContext(), Query("eventId"))
  public async listEventProxy(context: Context, eventId: string): Promise<Array<Proxy>> {
    return this.proxyRepo.all({ eventId, companyId: context.companyId }, { lean: true });
  }

  @Get("votings")
  @Bind(ApiContext(), Query("eventId"))
  public async getEventProxyVoting(context: Context, eventId: string): Promise<Voting[]> {
    return this.votingRepo.all({ companyId: context.companyId, eventId, voterType: { $in: [VoterTypeEnum.PROXY, VoterTypeEnum.CHAIRMAN] } });
  }

  @Get("voting-result")
  @Bind(ApiContext(), Query("eventId"))
  public async getEventProxyVotingResult(context: Context, eventId: string) {
    const event = await this.eventRepo.get(eventId);
    const votings = await this.votingRepo.all({
      companyId: context.companyId,
      eventId,
      voterType: { $in: [VoterTypeEnum.PROXY, VoterTypeEnum.CHAIRMAN] }
    });
    return VotingCalculator.calculate(votings, event.resolutions);
  }

  @Get(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async getEventProxyById(context: Context, eventId: string, proxyId: string): Promise<Proxy> {
    return this.proxyRepo.get(proxyId, {
      eventId,
      companyId: context.companyId
    });
  }

  @Post()
  @Bind(ApiContext(), Query("eventId"), Body())
  public async createProxy(context: Context, eventId: string, payload: AddProxyDto): Promise<Proxy> {
    const proxy: Proxy = {
      ...payload,
      proxyFormId: payload.proxyFormId as any,
      companyId: context.companyId,
      _id: undefined
    };
    const created = await this.proxyManager.addProxy(context.companyId, eventId, proxy);
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("added", {
          role: RoleEnum.PROXY,
          ref: created._id,
          name: created.name
        })
      }
    ]);
    return created;
  }

  @Patch(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async updateProxy(context: Context, eventId: string, proxyId: string, payload: AddProxyDto): Promise<Proxy> {
    const proxy: Proxy = {
      ...payload,
      proxyFormId: payload.proxyFormId as any,
      _id: proxyId,
      companyId: context.companyId,
      eventId
    };
    const updated = await this.proxyManager.updateProxy(context.companyId, eventId, proxy);
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("updated", {
          role: RoleEnum.PROXY,
          ref: updated._id,
          name: updated.name
        })
      }
    ]);
    return updated;
  }

  @Get(":id/votings")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async getProxyVotingById(context: Context, eventId: string, proxyId: string): Promise<Voting> {
    const proxy = await this.proxyRepo.get(proxyId, { companyId: context.companyId, eventId });
    return this.votingRepo.getOneBy("cds", proxy.cds, {
      eventId,
      companyId: context.companyId,
      voterType: { $in: [VoterTypeEnum.PROXY, VoterTypeEnum.CHAIRMAN] }
    });
  }

  @Post(":id/votings")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async createProxyVoting(context: Context, eventId: string, proxyId: string, payload: AddProxyVotingDto): Promise<Voting> {
    const proxy = await this.proxyRepo.get(proxyId, { companyId: context.companyId, eventId });
    return this.votingManager.voteAsProxy(context.id, proxy, payload.result, false);
  }

  @Patch(":id/votings")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async updateEventProxyVoting(context: Context, eventId: string, proxyId: string, proxyVotings: EditProxyVotingDto): Promise<Proxy> {
    return null;
  }

  // TODO-WAYNE: DELETE PROXY

  private async validateBeforeDeleteResolution(eventId: string, proxyId) {
    const votingExisted = await this.votingRepo.getOneBy("eventId", eventId);
    if (votingExisted) {
      throw new UserException({ message: "Cannot delete resolution because voting is using the resolution" });
    }
  }
}
