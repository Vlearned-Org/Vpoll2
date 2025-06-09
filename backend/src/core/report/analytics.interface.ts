import { Company, Event, Invitee, Corporate, Proxy, Shareholder, User, Voting } from "@app/data/model";
import { AttendanceAuditData, LeaveAuditData, Audit, QuestionAuditData } from "@app/data/model/audit.model";
import { ResolutionVotingResult } from "../../../../shared/contract/voting-report.interface";

export interface AnalyticsData<T> {
  company: Company;
  event: Event;
  data: T;
  metadata: {
    generatedAt: Date;
    totalRecords: number;
  };
}

export interface AttendanceAnalytics extends AnalyticsData<AttendanceAnalyticsData> {}
export interface VotingAnalytics extends AnalyticsData<VotingAnalyticsData> {}
export interface QuestionAnalytics extends AnalyticsData<QuestionAnalyticsData> {}
export interface UserEngagementAnalytics extends AnalyticsData<UserEngagementAnalyticsData> {}
export interface EventOverviewAnalytics extends AnalyticsData<EventOverviewAnalyticsData> {}

export interface AttendanceAnalyticsData {
  overview: {
    totalAttendees: number;
    currentlyOnline: number;
    averageDuration: number;
    peakAttendance: number;
    peakAttendanceTime: Date;
  };
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
  overview: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    completionRate: number;
  };
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
  overview: {
    totalQuestions: number;
    averageQuestionsPerUser: number;
    mostActiveHour: number;
    questionTrend: 'increasing' | 'decreasing' | 'stable';
  };
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
  overview: {
    totalUsers: number;
    activeUsers: number;
    legacyUsers: number;
    engagementScore: number;
  };
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
  overview: {
    eventDuration: number;
    totalParticipants: number;
    overallEngagement: number;
    successScore: number;
  };
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

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
}

export interface AnalyticsFilters {
  userTypes?: string[];
  dateRange?: AnalyticsTimeRange;
  includeInactive?: boolean;
} 