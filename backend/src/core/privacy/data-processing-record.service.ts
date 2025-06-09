import { Injectable } from '@nestjs/common';

export interface ProcessingActivity {
  activityId: string;
  name: string;
  purposes: string[];
  legalBasis: string[];
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  thirdCountryTransfers?: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  lastUpdated: Date;
  responsiblePerson: string;
  dataProtectionOfficer?: string;
}

@Injectable()
export class DataProcessingRecordService {
  private processingActivities: ProcessingActivity[] = [
    {
      activityId: 'VOTING_PLATFORM_CORE',
      name: 'Electronic Voting Platform Operations',
      purposes: [
        'Identity verification for voting eligibility',
        'Account management and authentication',
        'Electronic voting and AGM participation',
        'Audit and compliance reporting',
        'Security and fraud prevention'
      ],
      legalBasis: [
        'Consent (Art. 6(1)(a)) - for account creation',
        'Contract (Art. 6(1)(b)) - for voting services',
        'Legal obligation (Art. 6(1)(c)) - for regulatory compliance',
        'Legitimate interest (Art. 6(1)(f)) - for security'
      ],
      dataCategories: [
        'Identity data (name, NRIC/passport)',
        'Contact data (email, mobile)',
        'Authentication data (login credentials)',
        'Voting choices and participation records',
        'Technical data (IP addresses, device info)',
        'Usage data (platform interactions)'
      ],
      dataSubjects: [
        'Shareholders',
        'Proxy holders',
        'Corporate representatives',
        'Invitees',
        'Platform administrators'
      ],
      recipients: [
        'VPoll platform administrators',
        'Company secretaries and authorized officers',
        'Regulatory bodies (when required)',
        'IT service providers (under DPA)',
        'Audit firms (when required)'
      ],
      thirdCountryTransfers: [
        'Cloud hosting providers with Standard Contractual Clauses',
        'Analytics services with adequacy decisions'
      ],
      retentionPeriod: '7 years from last account activity or as required by corporate law',
      securityMeasures: [
        'End-to-end encryption for sensitive data',
        'Multi-factor authentication',
        'Regular security audits and penetration testing',
        'Role-based access controls',
        'Automated backup and disaster recovery',
        'SOC 2 compliance for service providers'
      ],
      lastUpdated: new Date(),
      responsiblePerson: 'Chief Technology Officer',
      dataProtectionOfficer: 'Data Protection Officer (dpo@vpoll.com)'
    },
    {
      activityId: 'MARKETING_COMMUNICATIONS',
      name: 'Marketing and Communications',
      purposes: [
        'Platform feature announcements',
        'Product improvement communications',
        'Event and voting notifications',
        'Customer satisfaction surveys'
      ],
      legalBasis: [
        'Consent (Art. 6(1)(a)) - for marketing communications',
        'Legitimate interest (Art. 6(1)(f)) - for service improvements'
      ],
      dataCategories: [
        'Contact information (email, mobile)',
        'Communication preferences',
        'Platform usage patterns',
        'Engagement metrics'
      ],
      dataSubjects: [
        'Platform users who have consented to marketing'
      ],
      recipients: [
        'Marketing team',
        'Email service providers',
        'Analytics platforms'
      ],
      retentionPeriod: 'Until consent withdrawn or 3 years of inactivity',
      securityMeasures: [
        'Encrypted data transmission',
        'Secure API connections',
        'Regular access reviews',
        'Data minimization practices'
      ],
      lastUpdated: new Date(),
      responsiblePerson: 'Marketing Director'
    },
    {
      activityId: 'ANALYTICS_PERFORMANCE',
      name: 'Platform Analytics and Performance Monitoring',
      purposes: [
        'Platform performance optimization',
        'User experience improvement',
        'Error detection and resolution',
        'Usage analytics for business insights'
      ],
      legalBasis: [
        'Consent (Art. 6(1)(a)) - for optional analytics',
        'Legitimate interest (Art. 6(1)(f)) - for essential performance monitoring'
      ],
      dataCategories: [
        'Technical data (browser, device, IP)',
        'Usage patterns and interactions',
        'Performance metrics',
        'Error logs (anonymized)'
      ],
      dataSubjects: [
        'All platform users (with appropriate consent levels)'
      ],
      recipients: [
        'Development team',
        'Analytics service providers',
        'Performance monitoring tools'
      ],
      thirdCountryTransfers: [
        'Google Analytics (adequacy decision)',
        'Performance monitoring services (SCCs)'
      ],
      retentionPeriod: '26 months for analytics data, 12 months for performance logs',
      securityMeasures: [
        'IP anonymization',
        'Data pseudonymization',
        'Restricted access controls',
        'Regular data purging'
      ],
      lastUpdated: new Date(),
      responsiblePerson: 'Head of Engineering'
    }
  ];

  public getAllProcessingActivities(): ProcessingActivity[] {
    return this.processingActivities;
  }

  public getProcessingActivity(activityId: string): ProcessingActivity | undefined {
    return this.processingActivities.find(activity => activity.activityId === activityId);
  }

  public generateDataProcessingRecord(): string {
    const record = {
      organization: 'VPoll Electronic Voting Platform',
      dataController: {
        name: 'VPoll Sdn Bhd',
        address: 'Malaysia', // Add actual address
        contact: 'privacy@vpoll.com',
        dpo: 'dpo@vpoll.com'
      },
      recordGenerated: new Date().toISOString(),
      processingActivities: this.processingActivities
    };

    return JSON.stringify(record, null, 2);
  }

  public updateProcessingActivity(activityId: string, updates: Partial<ProcessingActivity>): void {
    const index = this.processingActivities.findIndex(a => a.activityId === activityId);
    if (index !== -1) {
      this.processingActivities[index] = {
        ...this.processingActivities[index],
        ...updates,
        lastUpdated: new Date()
      };
    }
  }

  public validateProcessingActivities(): {isValid: boolean; issues: string[]} {
    const issues: string[] = [];

    this.processingActivities.forEach(activity => {
      if (!activity.legalBasis.length) {
        issues.push(`Activity ${activity.activityId}: Missing legal basis`);
      }
      
      if (!activity.retentionPeriod) {
        issues.push(`Activity ${activity.activityId}: Missing retention period`);
      }
      
      if (!activity.securityMeasures.length) {
        issues.push(`Activity ${activity.activityId}: Missing security measures`);
      }
      
      if (!activity.responsiblePerson) {
        issues.push(`Activity ${activity.activityId}: Missing responsible person`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }
} 