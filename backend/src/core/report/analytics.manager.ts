import {
  CompanyRepository,
  EventRepository,
  InviteeRepository,
  ProxyRepository,
  ShareholderRepository,
  UserRepository,
  VotingRepository,
  CorporateRepository
} from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Injectable } from "@nestjs/common";
import { RoleEnum, VoterTypeEnum } from "@vpoll-shared/enum";
import { VotingCalculator } from "../voting/voting-calculator.utils";
import {
  AttendanceAnalytics,
  VotingAnalytics,
  QuestionAnalytics,
  UserEngagementAnalytics,
  EventOverviewAnalytics,
  AttendanceAnalyticsData,
  VotingAnalyticsData,
  QuestionAnalyticsData,
  UserEngagementAnalyticsData,
  EventOverviewAnalyticsData,
  AnalyticsFilters
} from "./analytics.interface";

@Injectable()
export class AnalyticsManager {
  constructor(
    private companyRepo: CompanyRepository,
    private eventRepo: EventRepository,
    private votingRepo: VotingRepository,
    private auditRepo: AuditRepository,
    private userRepo: UserRepository,
    private shareholderRepo: ShareholderRepository,
    private proxyRepo: ProxyRepository,
    private inviteeRepo: InviteeRepository,
    private corporateRepo: CorporateRepository
  ) {}

  public async getAttendanceAnalytics(companyId: string, eventId: string, filters?: AnalyticsFilters): Promise<AttendanceAnalytics> {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const attendance = await this.auditRepo.listAttendance(eventId);
    const leave = await this.auditRepo.listLeave(eventId);

    // Get all user data similar to report manager
    const shareholderIds = [];
    const proxyIds = [];
    const inviteeIds = [];
    const corporateIds = [];

    for (let att of attendance) {
      if (att.data.role === RoleEnum.SHAREHOLDER) shareholderIds.push(att.data.ref);
      else if (att.data.role === RoleEnum.PROXY) proxyIds.push(att.data.ref);
      else if (att.data.role === RoleEnum.INVITEE) inviteeIds.push(att.data.ref);
      else if (att.data.role === RoleEnum.CORPORATE) corporateIds.push(att.data.ref);
    }

    const [shareholders, proxies, invitees, corporates] = await Promise.all([
      this.shareholderRepo.all({ _id: { $in: shareholderIds } }),
      this.proxyRepo.all({ _id: { $in: proxyIds } }),
      this.inviteeRepo.all({ _id: { $in: inviteeIds } }),
      this.corporateRepo.all({ _id: { $in: corporateIds } })
    ]);

    const analyticsData = this.processAttendanceData(attendance, leave, shareholders, proxies, invitees, corporates, event);

    return {
      company,
      event,
      data: analyticsData,
      metadata: {
        generatedAt: new Date(),
        totalRecords: attendance.length
      }
    };
  }

  public async getVotingAnalytics(companyId: string, eventId: string, filters?: AnalyticsFilters): Promise<VotingAnalytics> {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const votings = await this.votingRepo.all({ companyId, eventId });
    
    // Filter out duplicate votes (shareholders who also have proxy votes)
    const shareholderIds = new Set(
      votings.filter(item => item.voterType === 'SHAREHOLDER').map(item => String(item.shareholderId))
    );

    const filteredData = votings.filter(item => {
      if (item.voterType === 'PROXY') {
        return !shareholderIds.has(String(item.shareholderId));
      }
      return true;
    });

    const results = VotingCalculator.calculate(filteredData, event.resolutions);
    const analyticsData = this.processVotingData(filteredData, results, event);

    return {
      company,
      event,
      data: analyticsData,
      metadata: {
        generatedAt: new Date(),
        totalRecords: filteredData.length
      }
    };
  }

  public async getQuestionAnalytics(companyId: string, eventId: string, filters?: AnalyticsFilters): Promise<QuestionAnalytics> {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const questions = await this.auditRepo.listQuestion(eventId);
    const users = await this.userRepo.all({ _id: { $in: questions.map(q => q.userId) } });

    const analyticsData = this.processQuestionData(questions, users);

    return {
      company,
      event,
      data: analyticsData,
      metadata: {
        generatedAt: new Date(),
        totalRecords: questions.length
      }
    };
  }

  public async getUserEngagementAnalytics(companyId: string, eventId: string, filters?: AnalyticsFilters): Promise<UserEngagementAnalytics> {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    
    // Get all users associated with the event
    const [attendance, votings, questions, shareholders, proxies, invitees, corporates] = await Promise.all([
      this.auditRepo.listAttendance(eventId),
      this.votingRepo.all({ companyId, eventId }),
      this.auditRepo.listQuestion(eventId),
      this.shareholderRepo.all({ companyId }),
      this.proxyRepo.all({ companyId }),
      this.inviteeRepo.all({ companyId }),
      this.corporateRepo.all({ companyId })
    ]);

    const analyticsData = this.processUserEngagementData(attendance, votings, questions, shareholders, proxies, invitees, corporates);

    return {
      company,
      event,
      data: analyticsData,
      metadata: {
        generatedAt: new Date(),
        totalRecords: shareholders.length + proxies.length + invitees.length + corporates.length
      }
    };
  }

  public async getEventOverviewAnalytics(companyId: string, eventId: string, filters?: AnalyticsFilters): Promise<EventOverviewAnalytics> {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    
    // Get all event data
    const [attendance, leave, votings, questions] = await Promise.all([
      this.auditRepo.listAttendance(eventId),
      this.auditRepo.listLeave(eventId),
      this.votingRepo.all({ companyId, eventId }),
      this.auditRepo.listQuestion(eventId)
    ]);

    console.log(`Analytics Debug - Event ${eventId}:`);
    console.log(`- Attendance records: ${attendance.length}`);
    console.log(`- Voting records: ${votings.length}`);
    console.log(`- Question records: ${questions.length}`);

    const analyticsData = this.processEventOverviewData(attendance, leave, votings, questions, event);

    console.log('Processed timeline length:', analyticsData.participationTimeline.length);
    console.log('Timeline sample:', analyticsData.participationTimeline.slice(0, 3));

    return {
      company,
      event,
      data: analyticsData,
      metadata: {
        generatedAt: new Date(),
        totalRecords: attendance.length + votings.length + questions.length
      }
    };
  }

  private processAttendanceData(attendance, leave, shareholders, proxies, invitees, corporates, event): AttendanceAnalyticsData {
    const attendanceByType = {
      shareholders: 0,
      proxies: 0,
      invitees: 0,
      corporates: 0
    };

    const durations = [];
    const timelineData = new Map<string, { attendeeCount: number; joinCount: number; leaveCount: number }>();

    let totalDuration = 0;
    let currentAttendance = 0;
    let peakAttendance = 0;
    let peakAttendanceTime = null;

    // Process attendance data with 5-minute intervals
    for (let att of attendance) {
      const joinTime = new Date(att.data.joinAt);
      // Round to 5-minute intervals for better grouping
      const intervalMinutes = 5;
      const minutes = Math.floor(joinTime.getMinutes() / intervalMinutes) * intervalMinutes;
      const intervalTime = new Date(joinTime.getFullYear(), joinTime.getMonth(), joinTime.getDate(), joinTime.getHours(), minutes);
      const timeKey = intervalTime.toISOString().substring(0, 16); // minute precision

      if (!timelineData.has(timeKey)) {
        timelineData.set(timeKey, { attendeeCount: 0, joinCount: 0, leaveCount: 0 });
      }
      timelineData.get(timeKey).joinCount++;
      currentAttendance++;

      if (currentAttendance > peakAttendance) {
        peakAttendance = currentAttendance;
        peakAttendanceTime = joinTime;
      }

      // Calculate duration
      const leaveData = leave.find(l => l.data.ref.toString() === att.data.ref.toString());
      const leaveTime = leaveData ? new Date(leaveData.data.leaveAt) : new Date(event.endAt);
      const duration = (leaveTime.getTime() - joinTime.getTime()) / (1000 * 60); // minutes
      durations.push(duration);
      totalDuration += duration;

      // Count by type
      if (att.data.role === RoleEnum.SHAREHOLDER) attendanceByType.shareholders++;
      else if (att.data.role === RoleEnum.PROXY) attendanceByType.proxies++;
      else if (att.data.role === RoleEnum.INVITEE) attendanceByType.invitees++;
      else if (att.data.role === RoleEnum.CORPORATE) attendanceByType.corporates++;
    }

    // Process leave data with same interval grouping
    for (let lv of leave) {
      const leaveTime = new Date(lv.data.leaveAt);
      // Round to 5-minute intervals for consistency
      const intervalMinutes = 5;
      const minutes = Math.floor(leaveTime.getMinutes() / intervalMinutes) * intervalMinutes;
      const intervalTime = new Date(leaveTime.getFullYear(), leaveTime.getMonth(), leaveTime.getDate(), leaveTime.getHours(), minutes);
      const timeKey = intervalTime.toISOString().substring(0, 16);

      if (!timelineData.has(timeKey)) {
        timelineData.set(timeKey, { attendeeCount: 0, joinCount: 0, leaveCount: 0 });
      }
      timelineData.get(timeKey).leaveCount++;
      currentAttendance--;
    }

    // Build timeline with cumulative attendance count
    const attendanceOverTime = Array.from(timelineData.entries())
      .map(([timestamp, data]) => ({
        timestamp: new Date(timestamp),
        attendeeCount: data.joinCount - data.leaveCount, // Net change
        joinCount: data.joinCount,
        leaveCount: data.leaveCount
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate cumulative attendance
    let cumulativeAttendance = 0;
    attendanceOverTime.forEach(item => {
      cumulativeAttendance += item.attendeeCount;
      item.attendeeCount = Math.max(0, cumulativeAttendance); // Ensure non-negative
    });

    // If no timeline data, create baseline points
    if (attendanceOverTime.length === 0 && attendance.length > 0) {
      attendanceOverTime.push({
        timestamp: new Date(attendance[0].data.joinAt),
        attendeeCount: attendance.length,
        joinCount: attendance.length,
        leaveCount: 0
      });
    }

    // Duration distribution
    const durationRanges = [
      { min: 0, max: 30, label: '0-30 minutes' },
      { min: 30, max: 60, label: '30-60 minutes' },
      { min: 60, max: 120, label: '1-2 hours' },
      { min: 120, max: 240, label: '2-4 hours' },
      { min: 240, max: Infinity, label: '4+ hours' }
    ];

    const durationDistribution = durationRanges.map(range => {
      const count = durations.filter(d => d >= range.min && d < range.max).length;
      return {
        range: range.label,
        count,
        percentage: Math.round((count / durations.length) * 100)
      };
    });

    // Top attendees by duration
    const attendeesWithDuration = attendance.map(att => {
      const user = shareholders.find(s => s._id.toString() === att.data.ref.toString()) ||
                  proxies.find(p => p._id.toString() === att.data.ref.toString()) ||
                  invitees.find(i => i._id.toString() === att.data.ref.toString()) ||
                  corporates.find(c => c._id.toString() === att.data.ref.toString());
      
      const leaveData = leave.find(l => l.data.ref.toString() === att.data.ref.toString());
      const leaveTime = leaveData ? new Date(leaveData.data.leaveAt) : new Date(event.endAt);
      const duration = (leaveTime.getTime() - new Date(att.data.joinAt).getTime()) / (1000 * 60);

      return {
        name: user?.name || 'Unknown',
        type: att.data.role,
        duration: Math.round(duration),
        joinTime: new Date(att.data.joinAt),
        leaveTime: leaveData ? leaveTime : null
      };
    }).sort((a, b) => b.duration - a.duration).slice(0, 10);

    return {
      overview: {
        totalAttendees: attendance.length,
        currentlyOnline: Math.max(0, currentAttendance),
        averageDuration: Math.round(totalDuration / attendance.length),
        peakAttendance,
        peakAttendanceTime
      },
      attendanceByType,
      attendanceOverTime,
      durationDistribution,
      topAttendeesByDuration: attendeesWithDuration
    };
  }

  private processVotingData(votings, results, event): VotingAnalyticsData {
    const votingByType = {
      shareholders: votings.filter(v => v.voterType === VoterTypeEnum.SHAREHOLDER).length,
      proxies: votings.filter(v => v.voterType === VoterTypeEnum.PROXY).length,
      chairman: votings.filter(v => v.voterType === VoterTypeEnum.CHAIRMAN).length
    };

    const totalPossibleVoters = event.resolutions.length * votings.length;
    const totalActualVotes = votings.reduce((sum, voting) => sum + voting.result.length, 0);

    const resolutionResults = results.map(result => ({
      resolutionId: result.resolutionId,
      resolutionIndex: result.index,
      resolutionType: result.type,
      forVotes: result.for.unit,
      againstVotes: result.against.unit,
      abstainVotes: result.abstain ? result.abstain.unit : 0,
      totalShares: result.totalSharesExcludeAbstain,
      result: result.result,
      participationRate: Math.round(((result.for.record + result.against.record) / votings.length) * 100)
    }));

    // Voting patterns by type and resolution
    const votingPatterns = [];
    event.resolutions.forEach(resolution => {
      ['SHAREHOLDER', 'PROXY', 'CHAIRMAN'].forEach(voterType => {
        const typeVotings = votings.filter(v => v.voterType === voterType);
        const resolutionVotes = typeVotings
          .map(v => v.result.find(r => r.resolutionId.toString() === resolution._id.toString()))
          .filter(Boolean);

        const forCount = resolutionVotes.filter(v => v.response === 'FOR').length;
        const againstCount = resolutionVotes.filter(v => v.response === 'AGAINST').length;
        const abstainCount = resolutionVotes.filter(v => v.response === 'ABSTAIN').length;
        const total = resolutionVotes.length;

        if (total > 0) {
          votingPatterns.push({
            voterType,
            resolutionIndex: resolution.index,
            forPercentage: Math.round((forCount / total) * 100),
            againstPercentage: Math.round((againstCount / total) * 100),
            abstainPercentage: Math.round((abstainCount / total) * 100)
          });
        }
      });
    });

    // Shareholder participation by share size
    const shareholderVotings = votings.filter(v => v.voterType === VoterTypeEnum.SHAREHOLDER);
    const shareRanges = [
      { min: 0, max: 1000, label: '1-1,000 shares' },
      { min: 1000, max: 10000, label: '1,000-10,000 shares' },
      { min: 10000, max: 100000, label: '10,000-100,000 shares' },
      { min: 100000, max: Infinity, label: '100,000+ shares' }
    ];

    const shareholderParticipation = shareRanges.map(range => {
      const rangeVotings = shareholderVotings.filter(v => {
        const shareholder = v.shareholderId;
        const shares = shareholder.numberOfShares || 0;
        return shares >= range.min && shares < range.max;
      });

      const totalShares = rangeVotings.reduce((sum, v) => sum + (v.shareholderId.numberOfShares || 0), 0);

      return {
        shareRange: range.label,
        voterCount: rangeVotings.length,
        participationRate: Math.round((rangeVotings.length / shareholderVotings.length) * 100),
        totalShares
      };
    });

    return {
      overview: {
        totalVoters: votings.length,
        totalVotes: totalActualVotes,
        participationRate: Math.round((votings.length / 100) * 100), // Adjust based on expected attendance
        completionRate: Math.round((totalActualVotes / totalPossibleVoters) * 100)
      },
      votingByType,
      resolutionResults,
      votingPatterns,
      shareholderParticipation
    };
  }

  private processQuestionData(questions, users): QuestionAnalyticsData {
    const questionsByType = {
      shareholders: 0,
      proxies: 0,
      invitees: 0,
      corporates: 0
    };

    const questionsOverTime = [];
    const userQuestionCounts = new Map();
    const questionLengths = [];

    questions.forEach((question, index) => {
      const user = users.find(u => u._id.toString() === question.userId.toString());
      const roles = question.data.roles || [];
      
      // Count by type
      if (roles.includes(RoleEnum.SHAREHOLDER)) questionsByType.shareholders++;
      else if (roles.includes(RoleEnum.PROXY)) questionsByType.proxies++;
      else if (roles.includes(RoleEnum.INVITEE)) questionsByType.invitees++;
      else if (roles.includes(RoleEnum.CORPORATE)) questionsByType.corporates++;

      // Timeline data - keep exact timestamps for now
      questionsOverTime.push({
        timestamp: new Date(question.createdAt),
        questionCount: 1,
        cumulativeCount: index + 1
      });

      // User question counts
      const userId = question.userId.toString();
      userQuestionCounts.set(userId, (userQuestionCounts.get(userId) || 0) + 1);

      // Question length
      questionLengths.push(question.data.question.length);
    });

    // Sort questions timeline by timestamp
    questionsOverTime.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // If no questions timeline, create a basic one showing overall trend
    if (questionsOverTime.length === 0 && questions.length > 0) {
      // Create timeline points based on question creation times
      questions.forEach((question, index) => {
        questionsOverTime.push({
          timestamp: new Date(question.createdAt),
          questionCount: 1,
          cumulativeCount: index + 1
        });
      });
      questionsOverTime.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // Top questioners
    const topQuestioners = Array.from(userQuestionCounts.entries())
      .map(([userId, count]) => {
        const user = users.find(u => u._id.toString() === userId);
        const userQuestions = questions.filter(q => q.userId.toString() === userId);
        const firstQuestion = userQuestions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        const lastQuestion = userQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        return {
          name: user?.name || 'Unknown',
          userType: firstQuestion.data.roles?.[0] || 'UNKNOWN',
          questionCount: count,
          firstQuestionTime: new Date(firstQuestion.createdAt),
          lastQuestionTime: new Date(lastQuestion.createdAt)
        };
      })
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, 10);

    // Question length distribution
    const lengthRanges = [
      { min: 0, max: 50, label: '0-50 characters' },
      { min: 50, max: 100, label: '50-100 characters' },
      { min: 100, max: 200, label: '100-200 characters' },
      { min: 200, max: 500, label: '200-500 characters' },
      { min: 500, max: Infinity, label: '500+ characters' }
    ];

    const questionLengthDistribution = lengthRanges.map(range => {
      const count = questionLengths.filter(l => l >= range.min && l < range.max).length;
      return {
        lengthRange: range.label,
        count,
        percentage: Math.round((count / questionLengths.length) * 100)
      };
    });

    // Calculate trend (simplified)
    const halfPoint = Math.floor(questions.length / 2);
    const firstHalfAvg = halfPoint > 0 ? halfPoint / (questions.length > 0 ? 1 : 1) : 0;
    const secondHalfAvg = halfPoint > 0 ? (questions.length - halfPoint) / (questions.length > halfPoint ? 1 : 1) : 0;
    let questionTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.2) questionTrend = 'increasing';
    else if (firstHalfAvg > secondHalfAvg * 1.2) questionTrend = 'decreasing';

    // Most active hour
    const hourCounts = new Array(24).fill(0);
    questions.forEach(q => {
      const hour = new Date(q.createdAt).getHours();
      hourCounts[hour]++;
    });
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

    return {
      overview: {
        totalQuestions: questions.length,
        averageQuestionsPerUser: users.length > 0 ? Math.round((questions.length / users.length) * 100) / 100 : 0,
        mostActiveHour,
              questionTrend
    },
    questionsByType,
    questionsOverTime,
    topQuestioners,
    questionLengthDistribution
    };
  }

  private processUserEngagementData(attendance, votings, questions, shareholders, proxies, invitees, corporates): UserEngagementAnalyticsData {
    const totalUsers = shareholders.length + proxies.length + invitees.length + corporates.length;
    const legacyUsers = shareholders.filter(s => s.isLegacyUser).length + 
                       proxies.filter(p => p.isLegacyUser).length +
                       invitees.filter(i => i.isLegacyUser).length +
                       corporates.filter(c => c.isLegacyUser).length;

    // Calculate engagement metrics
    const attendedUserIds = new Set(attendance.map(a => a.data.ref.toString()));
    const votedUserIds = new Set(votings.map(v => v.shareholderId.toString()));
    const questionUserIds = new Set(questions.map(q => q.userId.toString()));
    
    const activeUsers = new Set([...attendedUserIds, ...votedUserIds, ...questionUserIds]).size;

    const engagementMetrics = [
      {
        userType: 'SHAREHOLDER',
        totalUsers: shareholders.length,
        attended: shareholders.filter(s => attendedUserIds.has(s._id.toString())).length,
        voted: shareholders.filter(s => votedUserIds.has(s._id.toString())).length,
        askedQuestions: 0, // Would need to cross-reference with user IDs
        engagementRate: 0
      },
      // Similar for other types...
    ];

    // Calculate engagement rates
    engagementMetrics.forEach(metric => {
      const totalEngagements = metric.attended + metric.voted + metric.askedQuestions;
      const maxPossibleEngagements = metric.totalUsers * 3; // 3 types of engagement
      metric.engagementRate = maxPossibleEngagements > 0 ? Math.round((totalEngagements / maxPossibleEngagements) * 100) : 0;
    });

    return {
      overview: {
        totalUsers,
        activeUsers,
        legacyUsers,
        engagementScore: Math.round((activeUsers / totalUsers) * 100)
      },
      usersByType: {
        shareholders: shareholders.length,
        proxies: proxies.length,
        invitees: invitees.length,
        corporates: corporates.length,
        admins: 0 // Would need admin repository
      },
      verificationStatus: {
        approved: 0,
        pending: 0,
        rejected: 0,
        none: 0
      },
      engagementMetrics,
      legacyUserMetrics: {
        totalLegacyUsers: legacyUsers,
        withFallbackContact: 0,
        requiresAssistance: 0,
        accessCodeGenerated: 0
      }
    };
  }

  private processEventOverviewData(attendance, leave, votings, questions, event): EventOverviewAnalyticsData {
    const eventStart = new Date(event.startAt);
    const eventEnd = new Date(event.endAt);
    const eventDuration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60); // minutes

    // Simplified timeline approach - just create basic data points
    const participationTimeline = [];

    // Always start with event start showing initial data
    participationTimeline.push({
      timestamp: eventStart,
      attendees: 0,
      activeVoters: 0,
      questionAskers: 0
    });

    // Add attendance points
    attendance.forEach(att => {
      participationTimeline.push({
        timestamp: new Date(att.data.joinAt),
        attendees: 1,
        activeVoters: 0,
        questionAskers: 0
      });
    });

    // Add voting points - distribute throughout event if no timestamp
    votings.forEach((vote, index) => {
      const voteTime = vote.createdAt ? 
        new Date(vote.createdAt) : 
        new Date(eventStart.getTime() + (index / votings.length) * (eventEnd.getTime() - eventStart.getTime()));
      
      participationTimeline.push({
        timestamp: voteTime,
        attendees: 0,
        activeVoters: 1,
        questionAskers: 0
      });
    });

    // Add question points
    questions.forEach(question => {
      participationTimeline.push({
        timestamp: new Date(question.createdAt),
        attendees: 0,
        activeVoters: 0,
        questionAskers: 1
      });
    });

    // Add event end
    participationTimeline.push({
      timestamp: eventEnd,
      attendees: 0,
      activeVoters: 0,
      questionAskers: 0
    });

    // Sort by timestamp and create cumulative data
    participationTimeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

         // Convert to cumulative totals for better visualization
     let cumulativeAttendees = 0;
     let cumulativeVoters = 0;
     let cumulativeQuestions = 0;

     participationTimeline.forEach(point => {
       cumulativeAttendees += point.attendees;
       cumulativeVoters += point.activeVoters;
       cumulativeQuestions += point.questionAskers;
       
       point.attendees = cumulativeAttendees;
       point.activeVoters = cumulativeVoters;
       point.questionAskers = cumulativeQuestions;
     });

     // Ensure we have at least some meaningful data points
     if (participationTimeline.length <= 2) {
       // Create hourly data points throughout the event showing totals
       const eventHours = Math.ceil(eventDuration / 60) || 1;
       const newTimeline = [];
       
       for (let i = 0; i <= eventHours; i++) {
         const timePoint = new Date(eventStart.getTime() + (i * 60 * 60 * 1000));
         newTimeline.push({
           timestamp: timePoint,
           attendees: attendance.length * (i / eventHours),
           activeVoters: votings.length * (i / eventHours),
           questionAskers: questions.length * (i / eventHours)
         });
       }
       
       if (newTimeline.length > participationTimeline.length) {
         participationTimeline.splice(0, participationTimeline.length, ...newTimeline);
       }
     }

    // Engagement heatmap based on actual event hours
    const eventStartHour = eventStart.getHours();
    const eventEndHour = eventEnd.getHours();
    const eventHours = [];
    
    // Generate hours from event start to end
    for (let h = eventStartHour; h <= eventEndHour; h++) {
      eventHours.push(h);
    }
    
    // If event spans across midnight, handle it
    if (eventEndHour < eventStartHour) {
      for (let h = eventStartHour; h < 24; h++) eventHours.push(h);
      for (let h = 0; h <= eventEndHour; h++) eventHours.push(h);
    }

    const maxActivity = Math.max(attendance.length, votings.length, questions.length) || 1;
    
    const engagementHeatmap = eventHours.map(hour => {
      // Count activities by hour
      const attendanceInHour = attendance.filter(att => new Date(att.data.joinAt).getHours() === hour).length;
      const votingInHour = votings.filter(vote => {
        const voteHour = vote.createdAt ? new Date(vote.createdAt).getHours() : eventStartHour;
        return voteHour === hour;
      }).length;
      const questionsInHour = questions.filter(q => new Date(q.createdAt).getHours() === hour).length;
      
      return {
        hour,
        attendanceLevel: Math.round((attendanceInHour / maxActivity) * 100),
        votingActivity: Math.round((votingInHour / maxActivity) * 100),
        questionActivity: Math.round((questionsInHour / maxActivity) * 100)
      };
    });

    // Key milestones
    const keyMilestones = [
      {
        timestamp: eventStart,
        event: 'Event Started',
        description: 'Annual General Meeting commenced',
        impact: 100
      },
      {
        timestamp: eventEnd,
        event: 'Event Ended',
        description: 'Annual General Meeting concluded',
        impact: 100
      }
    ];

    // Add voting milestones if resolutions exist
    if (event.resolutions && event.resolutions.length > 0) {
      event.resolutions.forEach((resolution, index) => {
        const resolutionVotes = votings.filter(v => 
          v.result.some(r => r.resolutionId.toString() === resolution._id.toString())
        );
        if (resolutionVotes.length > 0) {
          const firstVote = resolutionVotes.sort((a, b) => 
            new Date(a.createdAt || eventStart).getTime() - new Date(b.createdAt || eventStart).getTime()
          )[0];
          
          keyMilestones.push({
            timestamp: new Date(firstVote.createdAt || eventStart),
            event: `Resolution ${resolution.index} Voting Started`,
            description: `Voting commenced for ${resolution.type} Resolution ${resolution.index}`,
            impact: 75
          });
        }
      });
    }

    keyMilestones.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const totalParticipants = new Set([
      ...attendance.map(a => a.data.ref.toString()),
      ...votings.map(v => v.shareholderId.toString()),
      ...questions.map(q => q.userId.toString())
    ]).size;

    const overallEngagement = Math.round(
      ((attendance.length + votings.length + questions.length) / (totalParticipants * 3)) * 100
    );

    const successScore = Math.round(
      (attendance.length * 0.3 + votings.length * 0.5 + questions.length * 0.2) / totalParticipants * 100
    );

    return {
      overview: {
        eventDuration: Math.round(eventDuration),
        totalParticipants,
        overallEngagement,
        successScore
      },
      participationTimeline,
      engagementHeatmap,
      keyMilestones,
      comparisonMetrics: {
        previousEvents: [] // Would need to fetch previous events for comparison
      }
    };
  }
} 