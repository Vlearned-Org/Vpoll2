import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { ReportManager } from "@app/core/report/report.manager";
import { Bind, Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { RoleEnum } from "@vpoll-shared/enum";
import { Response } from "express";
import { Context } from "vm";

@Controller("api/reports")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class ReportController {
  constructor(private reportManager: ReportManager) {}

  @Get("question")
  @Bind(ApiContext(), Query("eventId"), Res())
  public async generateQuestionReport(context: Context, eventId: string, res: Response) {
    return this.reportManager.generateQuestionReport(context.companyId, eventId, res);
  }

  @Get("attendance")
  @Bind(ApiContext(), Query("eventId"), Res())
  public async generateAttendanceReport(context: Context, eventId: string, res: Response) {
    return this.reportManager.generateAttendanceReport(context.companyId, eventId, res);
  }

  @Get("quorum")
  @Bind(ApiContext(), Query("eventId"), Res())
  public async generateQuorumReport(context: Context, eventId: string, res: Response) {
    return this.reportManager.generateAttendanceReport(context.companyId, eventId, res);
  }

  @Get("proxy-consolidated")
  @Bind(ApiContext(), Query("eventId"), Res())
  public async generateProxyConsolidatedReport(context: Context, eventId: string, res: Response) {
    return this.reportManager.generateProxyConsolidatedReport(context.companyId, eventId, res);
  }

  @Get("proxy-voting")
  @Bind(ApiContext(), Query("eventId"), Res())
  public async generateProxyVotingReport(context: Context, eventId: string, res: Response) {
    return this.reportManager.generateProxyVotingReport(context.companyId, eventId, res);
  }

  @Get("voting")
  @Bind(ApiContext(), Query("eventId"), Res())
  public async generateVotingReport(context: Context, eventId: string, res: Response) {
    return this.reportManager.generateVotingReport(context.companyId, eventId, res);
  }
}
