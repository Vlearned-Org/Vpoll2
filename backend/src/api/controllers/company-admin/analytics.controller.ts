import { Controller, Get, Query, UseGuards, Bind } from "@nestjs/common";
import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { AnalyticsManager } from "@app/core/report/analytics.manager";
import { RoleEnum } from "@vpoll-shared/enum";
import { Context } from "vm";
import {
  AttendanceAnalytics,
  VotingAnalytics,
  QuestionAnalytics,
  UserEngagementAnalytics,
  EventOverviewAnalytics,
  AnalyticsFilters
} from "@app/core/report/analytics.interface";

@Controller("api/analytics")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class AnalyticsController {
  constructor(private analyticsManager: AnalyticsManager) {}

  @Get("attendance")
  @Bind(ApiContext(), Query("eventId"), Query("userTypes"), Query("dateStart"), Query("dateEnd"), Query("includeInactive"))
  public async getAttendanceAnalytics(
    context: Context,
    eventId: string,
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ): Promise<AttendanceAnalytics> {
    const filters: AnalyticsFilters = this.buildFilters(userTypes, dateStart, dateEnd, includeInactive);
    return this.analyticsManager.getAttendanceAnalytics(context.companyId, eventId, filters);
  }

  @Get("voting")
  @Bind(ApiContext(), Query("eventId"), Query("userTypes"), Query("dateStart"), Query("dateEnd"), Query("includeInactive"))
  public async getVotingAnalytics(
    context: Context,
    eventId: string,
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ): Promise<VotingAnalytics> {
    const filters: AnalyticsFilters = this.buildFilters(userTypes, dateStart, dateEnd, includeInactive);
    return this.analyticsManager.getVotingAnalytics(context.companyId, eventId, filters);
  }

  @Get("questions")
  @Bind(ApiContext(), Query("eventId"), Query("userTypes"), Query("dateStart"), Query("dateEnd"), Query("includeInactive"))
  public async getQuestionAnalytics(
    context: Context,
    eventId: string,
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ): Promise<QuestionAnalytics> {
    const filters: AnalyticsFilters = this.buildFilters(userTypes, dateStart, dateEnd, includeInactive);
    return this.analyticsManager.getQuestionAnalytics(context.companyId, eventId, filters);
  }

  @Get("user-engagement")
  @Bind(ApiContext(), Query("eventId"), Query("userTypes"), Query("dateStart"), Query("dateEnd"), Query("includeInactive"))
  public async getUserEngagementAnalytics(
    context: Context,
    eventId: string,
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ): Promise<UserEngagementAnalytics> {
    const filters: AnalyticsFilters = this.buildFilters(userTypes, dateStart, dateEnd, includeInactive);
    return this.analyticsManager.getUserEngagementAnalytics(context.companyId, eventId, filters);
  }

  @Get("event-overview")
  @Bind(ApiContext(), Query("eventId"), Query("userTypes"), Query("dateStart"), Query("dateEnd"), Query("includeInactive"))
  public async getEventOverviewAnalytics(
    context: Context,
    eventId: string,
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ): Promise<EventOverviewAnalytics> {
    const filters: AnalyticsFilters = this.buildFilters(userTypes, dateStart, dateEnd, includeInactive);
    return this.analyticsManager.getEventOverviewAnalytics(context.companyId, eventId, filters);
  }

  @Get("dashboard")
  @Bind(ApiContext(), Query("eventId"), Query("userTypes"), Query("dateStart"), Query("dateEnd"), Query("includeInactive"))
  public async getDashboardAnalytics(
    context: Context,
    eventId: string,
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ) {
    const filters: AnalyticsFilters = this.buildFilters(userTypes, dateStart, dateEnd, includeInactive);
    
    // Get all analytics data for dashboard
    const [attendance, voting, questions, userEngagement, eventOverview] = await Promise.all([
      this.analyticsManager.getAttendanceAnalytics(context.companyId, eventId, filters),
      this.analyticsManager.getVotingAnalytics(context.companyId, eventId, filters),
      this.analyticsManager.getQuestionAnalytics(context.companyId, eventId, filters),
      this.analyticsManager.getUserEngagementAnalytics(context.companyId, eventId, filters),
      this.analyticsManager.getEventOverviewAnalytics(context.companyId, eventId, filters)
    ]);

    return {
      attendance: attendance.data,
      voting: voting.data,
      questions: questions.data,
      userEngagement: userEngagement.data,
      eventOverview: eventOverview.data,
      company: attendance.company,
      event: attendance.event,
      metadata: {
        generatedAt: new Date(),
        filters
      }
    };
  }

  private buildFilters(
    userTypes?: string,
    dateStart?: string,
    dateEnd?: string,
    includeInactive?: boolean
  ): AnalyticsFilters {
    const filters: AnalyticsFilters = {};

    if (userTypes) {
      filters.userTypes = userTypes.split(',').map(type => type.trim());
    }

    if (dateStart && dateEnd) {
      filters.dateRange = {
        start: new Date(dateStart),
        end: new Date(dateEnd)
      };
    }

    if (includeInactive !== undefined) {
      filters.includeInactive = includeInactive;
    }

    return filters;
  }
} 