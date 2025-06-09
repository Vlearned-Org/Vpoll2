import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsFilters {
  userTypes?: string[];
  dateStart?: string;
  dateEnd?: string;
  includeInactive?: boolean;
}

export interface AnalyticsOverview {
  totalAttendees?: number;
  currentlyOnline?: number;
  averageDuration?: number;
  peakAttendance?: number;
  peakAttendanceTime?: Date;
  totalVoters?: number;
  totalVotes?: number;
  participationRate?: number;
  completionRate?: number;
  totalQuestions?: number;
  averageQuestionsPerUser?: number;
  mostActiveHour?: number;
  questionTrend?: 'increasing' | 'decreasing' | 'stable';
  totalUsers?: number;
  activeUsers?: number;
  legacyUsers?: number;
  engagementScore?: number;
  eventDuration?: number;
  totalParticipants?: number;
  overallEngagement?: number;
  successScore?: number;
}

export interface AttendanceAnalyticsData {
  overview: AnalyticsOverview;
  attendanceByType: {
    shareholders: number;
    proxies: number;
    invitees: number;
    corporates: number;
  };
  attendanceOverTime: Array<{
    timestamp: Date;
    attendeeCount: number;
    joinCount: number;
    leaveCount: number;
  }>;
  durationDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  topAttendeesByDuration: Array<{
    name: string;
    type: string;
    duration: number;
    joinTime: Date;
    leaveTime?: Date;
  }>;
}

export interface VotingAnalyticsData {
  overview: AnalyticsOverview;
  votingByType: {
    shareholders: number;
    proxies: number;
    chairman: number;
  };
  resolutionResults: Array<{
    resolutionId: string;
    resolutionIndex: number;
    resolutionType: string;
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
    totalShares: number;
    result: string;
    participationRate: number;
  }>;
  votingPatterns: Array<{
    voterType: string;
    resolutionIndex: number;
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
  }>;
  shareholderParticipation: Array<{
    shareRange: string;
    voterCount: number;
    participationRate: number;
    totalShares: number;
  }>;
}

export interface QuestionAnalyticsData {
  overview: AnalyticsOverview;
  questionsByType: {
    shareholders: number;
    proxies: number;
    invitees: number;
    corporates: number;
  };
  questionsOverTime: Array<{
    timestamp: Date;
    questionCount: number;
    cumulativeCount: number;
  }>;
  topQuestioners: Array<{
    name: string;
    userType: string;
    questionCount: number;
    firstQuestionTime: Date;
    lastQuestionTime: Date;
  }>;
  questionLengthDistribution: Array<{
    lengthRange: string;
    count: number;
    percentage: number;
  }>;
}

export interface UserEngagementAnalyticsData {
  overview: AnalyticsOverview;
  usersByType: {
    shareholders: number;
    proxies: number;
    invitees: number;
    corporates: number;
    admins: number;
  };
  verificationStatus: {
    approved: number;
    pending: number;
    rejected: number;
    none: number;
  };
  engagementMetrics: Array<{
    userType: string;
    totalUsers: number;
    attended: number;
    voted: number;
    askedQuestions: number;
    engagementRate: number;
  }>;
  legacyUserMetrics: {
    totalLegacyUsers: number;
    withFallbackContact: number;
    requiresAssistance: number;
    accessCodeGenerated: number;
  };
}

export interface EventOverviewAnalyticsData {
  overview: AnalyticsOverview;
  participationTimeline: Array<{
    timestamp: Date;
    attendees: number;
    activeVoters: number;
    questionAskers: number;
  }>;
  engagementHeatmap: Array<{
    hour: number;
    attendanceLevel: number;
    votingActivity: number;
    questionActivity: number;
  }>;
  keyMilestones: Array<{
    timestamp: Date;
    event: string;
    description: string;
    impact: number;
  }>;
  comparisonMetrics: {
    previousEvents?: Array<{
      eventId: string;
      eventName: string;
      participants: number;
      engagement: number;
      successScore: number;
    }>;
  };
}

export interface DashboardAnalyticsData {
  attendance: AttendanceAnalyticsData;
  voting: VotingAnalyticsData;
  questions: QuestionAnalyticsData;
  userEngagement: UserEngagementAnalyticsData;
  eventOverview: EventOverviewAnalyticsData;
  metadata: {
    generatedAt: Date;
    filters: AnalyticsFilters;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsHttpService {
  private readonly baseUrl = '/api/analytics';

  constructor(private http: HttpClient) {}

  public getAttendanceAnalytics(eventId: string, filters?: AnalyticsFilters): Observable<{data: AttendanceAnalyticsData}> {
    const params = this.buildParams(eventId, filters);
    return this.http.get<{data: AttendanceAnalyticsData}>(`${this.baseUrl}/attendance`, { params });
  }

  public getVotingAnalytics(eventId: string, filters?: AnalyticsFilters): Observable<{data: VotingAnalyticsData}> {
    const params = this.buildParams(eventId, filters);
    return this.http.get<{data: VotingAnalyticsData}>(`${this.baseUrl}/voting`, { params });
  }

  public getQuestionAnalytics(eventId: string, filters?: AnalyticsFilters): Observable<{data: QuestionAnalyticsData}> {
    const params = this.buildParams(eventId, filters);
    return this.http.get<{data: QuestionAnalyticsData}>(`${this.baseUrl}/questions`, { params });
  }

  public getUserEngagementAnalytics(eventId: string, filters?: AnalyticsFilters): Observable<{data: UserEngagementAnalyticsData}> {
    const params = this.buildParams(eventId, filters);
    return this.http.get<{data: UserEngagementAnalyticsData}>(`${this.baseUrl}/user-engagement`, { params });
  }

  public getEventOverviewAnalytics(eventId: string, filters?: AnalyticsFilters): Observable<{data: EventOverviewAnalyticsData}> {
    const params = this.buildParams(eventId, filters);
    return this.http.get<{data: EventOverviewAnalyticsData}>(`${this.baseUrl}/event-overview`, { params });
  }

  public getDashboardAnalytics(eventId: string, filters?: AnalyticsFilters): Observable<DashboardAnalyticsData> {
    const params = this.buildParams(eventId, filters);
    return this.http.get<DashboardAnalyticsData>(`${this.baseUrl}/dashboard`, { params });
  }

  private buildParams(eventId: string, filters?: AnalyticsFilters): HttpParams {
    let params = new HttpParams().set('eventId', eventId);

    if (filters) {
      if (filters.userTypes && filters.userTypes.length > 0) {
        params = params.set('userTypes', filters.userTypes.join(','));
      }
      if (filters.dateStart) {
        params = params.set('dateStart', filters.dateStart);
      }
      if (filters.dateEnd) {
        params = params.set('dateEnd', filters.dateEnd);
      }
      if (filters.includeInactive !== undefined) {
        params = params.set('includeInactive', filters.includeInactive.toString());
      }
    }

    return params;
  }
} 