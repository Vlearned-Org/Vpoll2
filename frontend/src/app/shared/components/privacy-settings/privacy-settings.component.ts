import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConsentRecord } from '../consent-form/consent-form.component';

export interface DataSubjectRequest {
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDate: Date;
  completionDate?: Date;
  description: string;
  requestId: string;
}

export interface PrivacySettings {
  consentRecords: ConsentRecord[];
  dataSubjectRequests: DataSubjectRequest[];
  lastDataExport?: Date;
  accountCreatedDate: Date;
  lastDataUpdate: Date;
  retentionPeriodEnd?: Date;
}

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.scss']
})
export class PrivacySettingsComponent implements OnInit {
  public privacyForm: FormGroup;
  public privacySettings: PrivacySettings;
  public activeTab = 0;
  public loading = false;
  public consentHistory: ConsentRecord[] = [];
  public dataRequests: DataSubjectRequest[] = [];

  // Data rights info
  public dataRights = [
    {
      title: 'Right of Access',
      description: 'Request a copy of all personal data we hold about you',
      icon: 'pi-eye',
      action: 'access',
      enabled: true
    },
    {
      title: 'Right to Rectification',
      description: 'Correct any inaccurate or incomplete personal data',
      icon: 'pi-pencil',
      action: 'rectification',
      enabled: true
    },
    {
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data (subject to legal requirements)',
      icon: 'pi-trash',
      action: 'erasure',
      enabled: true
    },
    {
      title: 'Right to Restrict Processing',
      description: 'Limit how we process your personal data',
      icon: 'pi-pause',
      action: 'restriction',
      enabled: true
    },
    {
      title: 'Right to Data Portability',
      description: 'Receive your data in a machine-readable format',
      icon: 'pi-download',
      action: 'portability',
      enabled: true
    },
    {
      title: 'Right to Object',
      description: 'Object to processing based on legitimate interests',
      icon: 'pi-ban',
      action: 'objection',
      enabled: true
    }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPrivacySettings();
  }

  private initializeForm(): void {
    this.privacyForm = this.fb.group({
      // Communication preferences
      emailCommunicationConsent: [false],
      smsCommunicationConsent: [false],
      phoneCallConsent: [false],
      marketingConsent: [false],
      
      // Analytics and tracking
      analyticsConsent: [false],
      thirdPartyAnalyticsConsent: [false],
      
      // Cookies
      functionalCookiesConsent: [true], // Always required
      marketingCookiesConsent: [false],
      
      // Social media
      socialMediaConsent: [false],
      
      // Data sharing
      legalComplianceConsent: [true] // Always required for voting platform
    });

    // Watch for form changes
    this.privacyForm.valueChanges.subscribe(() => {
      this.onPreferencesChange();
    });
  }

  private loadPrivacySettings(): void {
    // In a real implementation, this would load from your backend
    // Mock data for demonstration
    this.consentHistory = [
      {
        consentId: 'signup_consent_123',
        consentType: 'dataProcessingConsent',
        granted: true,
        purpose: 'Account creation and management',
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        version: '1.0',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        consentId: 'marketing_consent_124',
        consentType: 'marketingConsent',
        granted: false,
        purpose: 'Marketing communications',
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        version: '1.0',
        withdrawnAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        withdrawalReason: 'User preference'
      }
    ];

    this.dataRequests = [
      {
        requestType: 'access',
        status: 'completed',
        requestDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        description: 'Data access request completed',
        requestId: 'REQ-001'
      }
    ];

    // Populate form with current settings
    this.updateFormFromConsentHistory();
  }

  private updateFormFromConsentHistory(): void {
    // Update form based on latest consent records
    const latestConsents = this.getLatestConsents();
    
    Object.keys(this.privacyForm.controls).forEach(key => {
      const consent = latestConsents.find(c => c.consentType === key);
      if (consent) {
        this.privacyForm.get(key)?.setValue(consent.granted, { emitEvent: false });
      }
    });
  }

  private getLatestConsents(): ConsentRecord[] {
    // Get the most recent consent for each type
    const consentMap = new Map<string, ConsentRecord>();
    
    this.consentHistory.forEach(consent => {
      const existing = consentMap.get(consent.consentType);
      if (!existing || consent.timestamp > existing.timestamp) {
        consentMap.set(consent.consentType, consent);
      }
    });

    return Array.from(consentMap.values());
  }

  public onPreferencesChange(): void {
    // This would normally save to backend
    console.log('Privacy preferences changed:', this.privacyForm.value);
  }

  public savePrivacySettings(): void {
    this.loading = true;
    
    // Create new consent records for changed preferences
    const newConsents = this.createConsentRecordsFromForm();
    
    // In a real implementation, this would call your backend API
    setTimeout(() => {
      this.consentHistory = [...this.consentHistory, ...newConsents];
      this.loading = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Settings Saved',
        detail: 'Your privacy preferences have been updated successfully.'
      });
    }, 1500);
  }

  private createConsentRecordsFromForm(): ConsentRecord[] {
    const formValue = this.privacyForm.value;
    const timestamp = new Date();
    const records: ConsentRecord[] = [];

    Object.keys(formValue).forEach(key => {
      records.push({
        consentId: `${key}_${timestamp.getTime()}`,
        consentType: key,
        granted: formValue[key],
        purpose: this.getPurposeForConsentType(key),
        legalBasis: this.getLegalBasisForConsentType(key),
        timestamp: timestamp,
        version: '1.0',
        ipAddress: 'CURRENT_IP',
        userAgent: navigator.userAgent
      });
    });

    return records;
  }

  private getPurposeForConsentType(consentType: string): string {
    const purposes: { [key: string]: string } = {
      emailCommunicationConsent: 'Email notifications about voting events',
      smsCommunicationConsent: 'SMS notifications for urgent reminders',
      marketingConsent: 'Marketing communications and promotional materials',
      analyticsConsent: 'Usage analytics for platform improvement',
      thirdPartyAnalyticsConsent: 'Third-party analytics services',
      functionalCookiesConsent: 'Essential cookies for platform functionality',
      marketingCookiesConsent: 'Marketing and advertising cookies',
      socialMediaConsent: 'Social media integration',
      legalComplianceConsent: 'Legal compliance and regulatory requirements'
    };
    
    return purposes[consentType] || 'Data processing';
  }

  private getLegalBasisForConsentType(consentType: string): string {
    const requiredConsents = ['functionalCookiesConsent', 'legalComplianceConsent'];
    
    if (requiredConsents.includes(consentType)) {
      return 'Necessary for service (Art. 6(1)(b) GDPR)';
    }
    
    return 'Consent (Art. 6(1)(a) GDPR)';
  }

  public exerciseDataRight(rightType: string): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to submit a ${rightType} request? We will process your request within 30 days as required by GDPR.`,
      header: `${rightType.charAt(0).toUpperCase() + rightType.slice(1)} Request`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitDataSubjectRequest(rightType as any);
      }
    });
  }

  private submitDataSubjectRequest(requestType: DataSubjectRequest['requestType']): void {
    const newRequest: DataSubjectRequest = {
      requestType,
      status: 'pending',
      requestDate: new Date(),
      description: `${requestType} request submitted`,
      requestId: `REQ-${Date.now()}`
    };

    this.dataRequests = [newRequest, ...this.dataRequests];

    this.messageService.add({
      severity: 'success',
      summary: 'Request Submitted',
      detail: `Your ${requestType} request has been submitted. We will process it within 30 days and contact you at your registered email address.`
    });
  }

  public downloadPersonalData(): void {
    this.loading = true;
    
    // Simulate data export
    setTimeout(() => {
      // In a real implementation, this would call your backend to generate the export
      const dataExport = {
        exportDate: new Date(),
        personalData: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          nric: '123456789',
          // ... other personal data
        },
        consentHistory: this.consentHistory,
        votingHistory: [],
        accountActivity: []
      };

      const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vpoll-personal-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Data Export Complete',
        detail: 'Your personal data has been downloaded.'
      });
    }, 2000);
  }

  public withdrawConsent(consentType: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to withdraw this consent? This may limit some platform functionality.',
      header: 'Withdraw Consent',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const control = this.privacyForm.get(consentType);
        if (control) {
          control.setValue(false);
          
          // Create withdrawal record
          const withdrawalRecord: ConsentRecord = {
            consentId: `withdrawal_${consentType}_${Date.now()}`,
            consentType,
            granted: false,
            purpose: this.getPurposeForConsentType(consentType),
            legalBasis: this.getLegalBasisForConsentType(consentType),
            timestamp: new Date(),
            version: '1.0',
            withdrawnAt: new Date(),
            withdrawalReason: 'User withdrawal'
          };

          this.consentHistory = [withdrawalRecord, ...this.consentHistory];
          
          this.messageService.add({
            severity: 'info',
            summary: 'Consent Withdrawn',
            detail: 'Your consent has been withdrawn successfully.'
          });
        }
      }
    });
  }

  public getStatusSeverity(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  }

  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public contactDPO(): void {
    const subject = encodeURIComponent('Privacy Inquiry - Data Protection Rights');
    const body = encodeURIComponent(`Dear Data Protection Officer,

I would like to inquire about my data protection rights under GDPR.

Please contact me regarding:
[ ] General privacy inquiry
[ ] Data subject rights exercise
[ ] Consent management
[ ] Data processing questions
[ ] Other: _______________

Best regards,
[Your Name]`);
    
    const mailtoLink = `mailto:dpo@vpoll.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  }
} 