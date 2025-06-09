import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { AnalyticsHttpService, DashboardAnalyticsData, AnalyticsFilters } from '@app/shared/http-services/analytics-http.service';
import { MessageService } from 'primeng/api';
import { Event } from '@vpoll-shared/contract';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-event-analytics',
  templateUrl: './event-analytics.component.html',
  styleUrls: ['./event-analytics.component.scss'],
})
export class EventAnalyticsComponent implements OnInit {
  public event: Event;
  public analyticsData: DashboardAnalyticsData;
  public loading = false;
  public showFilters = false;
  public showDetailedDialog = false;
  public detailedViewType: string = '';
  public detailedViewTitle: string = '';

  // Filter properties
  public filters: AnalyticsFilters = {};
  public dateStart: Date;
  public dateEnd: Date;
  public userTypeOptions = [
    { label: 'Shareholders', value: 'SHAREHOLDER' },
    { label: 'Proxies', value: 'PROXY' },
    { label: 'Invitees', value: 'INVITEE' },
    { label: 'Corporate Representatives', value: 'CORPORATE' }
  ];

  // Chart data
  public attendanceByTypeChartData: any;
  public votingResultsChartData: any;
  public questionsTimelineChartData: any;
  public userTypesChartData: any;
  public participationTimelineChartData: any;

  // Chart options
  public chartOptions: any;
  public timelineChartOptions: any;

  constructor(
    private analyticsService: AnalyticsHttpService,
    private eventContextService: EventContextService,
    private messageService: MessageService
  ) {}

  public ngOnInit(): void {
    this.event = this.eventContextService.event;
    this.initializeChartOptions();
    this.loadAnalytics();
  }

  public loadAnalytics(): void {
    if (!this.event) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No event context available'
      });
      return;
    }

    this.loading = true;
    this.analyticsService.getDashboardAnalytics(this.event._id, this.filters).subscribe(
      (data) => {
        console.log('Analytics data received:', data);
        this.analyticsData = data;
        this.prepareChartData();
        this.loading = false;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Failed to load analytics data'
        });
        this.loading = false;
      }
    );
  }

  public applyFilters(): void {
    // Build filters object
    this.filters = {};
    
    if (this.dateStart && this.dateEnd) {
      this.filters.dateStart = this.dateStart.toISOString();
      this.filters.dateEnd = this.dateEnd.toISOString();
    }

    this.loadAnalytics();
    this.showFilters = false;
  }

  public clearFilters(): void {
    this.filters = {};
    this.dateStart = null;
    this.dateEnd = null;
    this.loadAnalytics();
  }

  public showDetailedView(viewType: string): void {
    this.detailedViewType = viewType;
    this.detailedViewTitle = this.getDetailedViewTitle(viewType);
    this.showDetailedDialog = true;
  }

  public showEventTimeline(): void {
    this.showDetailedView('timeline');
  }

  public formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  public getMilestoneSeverity(impact: number): string {
    if (impact >= 90) return 'success';
    if (impact >= 70) return 'info';
    if (impact >= 50) return 'warning';
    return 'secondary';
  }

  private getDetailedViewTitle(viewType: string): string {
    const titles = {
      attendance: 'Detailed Attendance Analytics',
      voting: 'Detailed Voting Analytics',
      questions: 'Detailed Questions Analytics',
      engagement: 'Detailed User Engagement',
      timeline: 'Event Timeline & Milestones'
    };
    return titles[viewType] || 'Detailed Analytics';
  }

  private initializeChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

    this.timelineChartOptions = {
      ...this.chartOptions,
      scales: {
        ...this.chartOptions.scales,
        x: {
          ...this.chartOptions.scales.x,
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm'
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };
  }

  private prepareChartData(): void {
    if (!this.analyticsData) return;

    this.prepareAttendanceChartData();
    this.prepareVotingChartData();
    this.prepareQuestionsChartData();
    this.prepareUserTypesChartData();
    this.prepareParticipationTimelineData();
  }

  private prepareAttendanceChartData(): void {
    if (!this.analyticsData.attendance?.attendanceByType) return;

    const attendanceData = this.analyticsData.attendance.attendanceByType;
    
    this.attendanceByTypeChartData = {
      labels: ['Shareholders', 'Proxies', 'Invitees', 'Corporate Representatives'],
      datasets: [{
        data: [
          attendanceData.shareholders,
          attendanceData.proxies,
          attendanceData.invitees,
          attendanceData.corporates
        ],
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Orange
          '#8B5CF6'  // Purple
        ],
        borderWidth: 0
      }]
    };
  }

  private prepareVotingChartData(): void {
    if (!this.analyticsData.voting?.resolutionResults) return;

    const resolutions = this.analyticsData.voting.resolutionResults;
    
    this.votingResultsChartData = {
      labels: resolutions.map(r => `${r.resolutionType} ${r.resolutionIndex}`),
      datasets: [
        {
          label: 'For Votes',
          data: resolutions.map(r => r.forVotes),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1
        },
        {
          label: 'Against Votes',
          data: resolutions.map(r => r.againstVotes),
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          borderWidth: 1
        },
        {
          label: 'Abstain Votes',
          data: resolutions.map(r => r.abstainVotes),
          backgroundColor: '#6B7280',
          borderColor: '#4B5563',
          borderWidth: 1
        }
      ]
    };
  }

  private prepareQuestionsChartData(): void {
    if (!this.analyticsData.questions?.questionsOverTime) {
      console.log('No questions timeline data found');
      return;
    }

    const questionsTimeline = this.analyticsData.questions.questionsOverTime;
    console.log('Questions timeline data:', questionsTimeline);
    
    this.questionsTimelineChartData = {
      labels: questionsTimeline.map(q => new Date(q.timestamp)),
      datasets: [{
        label: 'Questions Asked',
        data: questionsTimeline.map(q => q.questionCount),
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF6',
        tension: 0.4,
        fill: false
      }, {
        label: 'Cumulative Questions',
        data: questionsTimeline.map(q => q.cumulativeCount),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  private prepareUserTypesChartData(): void {
    if (!this.analyticsData.userEngagement?.usersByType) return;

    const userTypes = this.analyticsData.userEngagement.usersByType;
    
    this.userTypesChartData = {
      labels: ['Shareholders', 'Proxies', 'Invitees', 'Corporate Representatives'],
      datasets: [{
        data: [
          userTypes.shareholders,
          userTypes.proxies,
          userTypes.invitees,
          userTypes.corporates
        ],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6'
        ],
        borderWidth: 0
      }]
    };
  }

  private prepareParticipationTimelineData(): void {
    if (!this.analyticsData.eventOverview?.participationTimeline) {
      console.log('No participation timeline data found');
      return;
    }

    const timeline = this.analyticsData.eventOverview.participationTimeline;
    console.log('Participation timeline data:', timeline);
    
    this.participationTimelineChartData = {
      labels: timeline.map(t => new Date(t.timestamp)),
      datasets: [
        {
          label: 'Attendees',
          data: timeline.map(t => t.attendees),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Active Voters',
          data: timeline.map(t => t.activeVoters),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Question Askers',
          data: timeline.map(t => t.questionAskers),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }
} 