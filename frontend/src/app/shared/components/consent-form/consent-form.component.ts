import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ConsentRecord {
  consentId: string;
  consentType: string;
  granted: boolean;
  purpose: string;
  legalBasis: string;
  timestamp: Date;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  withdrawnAt?: Date;
  withdrawalReason?: string;
}

@Component({
  selector: 'app-consent-form',
  templateUrl: './consent-form.component.html',
  styleUrls: ['./consent-form.component.scss']
})
export class ConsentFormComponent implements OnInit {
  @Input() consentType: 'signup' | 'login' = 'signup';
  @Input() allowGranularConsent: boolean = true;
  @Output() consentChanged = new EventEmitter<{valid: boolean, consents: ConsentRecord[]}>();
  
  public consentForm: FormGroup;
  public showFullDetails = false;
  public consentVersion = '1.0';
  public showCookieConsent = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeConsentForm();

    // Emit consent status whenever form validity changes
    this.consentForm.valueChanges.subscribe(() => {
      this.emitConsentChanges();
    });
  }

  private initializeConsentForm(): void {
    if (this.allowGranularConsent) {
      this.consentForm = this.fb.group({
        // Essential consents (required)
        dataProcessingConsent: [false, Validators.requiredTrue],
        termsAndConditions: [false, Validators.requiredTrue],
        
        // Granular consents (optional)
        marketingConsent: [false],
        analyticsConsent: [false],
        functionalCookiesConsent: [true], // Pre-checked for essential functionality
        marketingCookiesConsent: [false],
        socialMediaConsent: [false],
        
        // Communication preferences
        emailCommunicationConsent: [true], // For essential notifications
        smsCommunicationConsent: [false],
        phoneCallConsent: [false],
        
        // Data sharing consents
        thirdPartyAnalyticsConsent: [false],
        legalComplianceConsent: [true] // Required for voting platform
      });
    } else {
      // Simplified consent for login
      this.consentForm = this.fb.group({
        dataProcessingConsent: [false, Validators.requiredTrue],
        termsAndConditions: [false, Validators.requiredTrue],
        functionalCookiesConsent: [true]
      });
    }
  }

  private emitConsentChanges(): void {
    const consents = this.buildConsentRecords();
    const isValid = this.isConsentValid;
    
    this.consentChanged.emit({
      valid: isValid,
      consents: consents
    });
  }

  private buildConsentRecords(): ConsentRecord[] {
    const formValue = this.consentForm.value;
    const timestamp = new Date();
    const records: ConsentRecord[] = [];

    // Map form controls to consent records
    const consentMappings = [
      {
        control: 'dataProcessingConsent',
        purpose: 'Essential data processing for account management and voting participation',
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        required: true
      },
      {
        control: 'termsAndConditions',
        purpose: 'Agreement to terms of service and platform usage',
        legalBasis: 'Contract (Art. 6(1)(b) GDPR)',
        required: true
      },
      {
        control: 'marketingConsent',
        purpose: 'Marketing communications and promotional materials',
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        required: false
      },
      {
        control: 'analyticsConsent',
        purpose: 'Analytics and usage statistics for platform improvement',
        legalBasis: 'Legitimate Interest (Art. 6(1)(f) GDPR)',
        required: false
      },
      {
        control: 'functionalCookiesConsent',
        purpose: 'Essential cookies for platform functionality',
        legalBasis: 'Necessary for service (Art. 6(1)(b) GDPR)',
        required: true
      },
      {
        control: 'marketingCookiesConsent',
        purpose: 'Marketing and advertising cookies',
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        required: false
      },
      {
        control: 'emailCommunicationConsent',
        purpose: 'Essential email notifications about voting events',
        legalBasis: 'Legitimate Interest (Art. 6(1)(f) GDPR)',
        required: false
      }
    ];

    consentMappings.forEach(mapping => {
      if (formValue.hasOwnProperty(mapping.control)) {
        records.push({
          consentId: `${mapping.control}_${timestamp.getTime()}`,
          consentType: mapping.control,
          granted: formValue[mapping.control],
          purpose: mapping.purpose,
          legalBasis: mapping.legalBasis,
          timestamp: timestamp,
          version: this.consentVersion,
          ipAddress: this.getUserIP(),
          userAgent: navigator.userAgent
        });
      }
    });

    return records;
  }

  private getUserIP(): string {
    // In a real implementation, you'd get this from your backend
    // or a service that provides the user's IP address
    return 'IP_TO_BE_DETERMINED';
  }

  public get isConsentValid(): boolean {
    const requiredConsents = ['dataProcessingConsent', 'termsAndConditions'];
    return requiredConsents.every(consent => 
      this.consentForm.get(consent)?.value === true
    );
  }

  public toggleDetails(): void {
    this.showFullDetails = !this.showFullDetails;
  }

  public openTermsAndConditions(event: Event): void {
    event.preventDefault();
    // In production, this would open a proper modal or navigate to T&C page
    const termsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (termsWindow) {
      termsWindow.document.write(this.getTermsAndConditionsHTML());
    }
  }

  public openPrivacyPolicy(event: Event): void {
    event.preventDefault();
    // In production, this would open a proper modal or navigate to privacy policy page
    const privacyWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (privacyWindow) {
      privacyWindow.document.write(this.getPrivacyPolicyHTML());
    }
  }

  public openCookiePolicy(event: Event): void {
    event.preventDefault();
    const cookieWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (cookieWindow) {
      cookieWindow.document.write(this.getCookiePolicyHTML());
    }
  }

  public getDataCollectionText(): string {
    if (this.consentType === 'signup') {
      return 'By creating an account, we collect the following information from you:';
    } else {
      return 'When you log in, we process the following information:';
    }
  }

  public getDataUsageText(): string {
    return 'This information is used for:';
  }

  public withdrawConsent(consentType: string): void {
    // This method would be used in a user preferences/privacy settings page
    const control = this.consentForm.get(consentType);
    if (control) {
      control.setValue(false);
    }
  }

  public getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  // Mock implementations - in production these would be proper documents
  private getTermsAndConditionsHTML(): string {
    return `
      <html>
        <head><title>Terms and Conditions - VPoll</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Terms and Conditions</h1>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the VPoll platform, you accept and agree to be bound by these Terms and Conditions.</p>
          
          <h2>2. Voting Platform Services</h2>
          <p>VPoll provides electronic voting services for Annual General Meetings (AGMs) and corporate governance events.</p>
          
          <h2>3. User Obligations</h2>
          <p>Users must provide accurate information and use the platform responsibly for legitimate voting purposes only.</p>
          
          <h2>4. Data Protection</h2>
          <p>Your personal data is processed in accordance with our Privacy Policy and applicable data protection laws.</p>
          
          <h2>5. Limitation of Liability</h2>
          <p>VPoll's liability is limited to the extent permitted by applicable law.</p>
          
          <p><em>These are sample terms for development purposes. Full legal terms will be provided at launch.</em></p>
        </body>
      </html>
    `;
  }

  private getPrivacyPolicyHTML(): string {
    return `
      <html>
        <head><title>Privacy Policy - VPoll</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Privacy Policy</h1>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <ul>
            <li><strong>Personal Information:</strong> Name, NRIC/Passport, Email, Mobile Number</li>
            <li><strong>Authentication Data:</strong> Login credentials, session information</li>
            <li><strong>Voting Data:</strong> Voting choices, participation records</li>
            <li><strong>Technical Data:</strong> IP address, browser information, usage logs</li>
          </ul>
          
          <h2>2. Legal Basis for Processing</h2>
          <ul>
            <li><strong>Consent:</strong> Marketing communications, optional features</li>
            <li><strong>Contract:</strong> Account management, voting services</li>
            <li><strong>Legal Obligation:</strong> Regulatory compliance, audit requirements</li>
            <li><strong>Legitimate Interest:</strong> Security, fraud prevention, service improvement</li>
          </ul>
          
          <h2>3. Data Retention</h2>
          <p>Personal data is retained for the duration of your account plus 7 years for legal compliance, or as required by law.</p>
          
          <h2>4. Your Rights</h2>
          <ul>
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure (subject to legal requirements)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
          </ul>
          
          <h2>5. Contact Information</h2>
          <p>Data Protection Officer: dpo@vpoll.com</p>
          <p>General Inquiries: privacy@vpoll.com</p>
          
          <p><em>This is a sample privacy policy for development purposes. Full legal policy will be provided at launch.</em></p>
        </body>
      </html>
    `;
  }

  private getCookiePolicyHTML(): string {
    return `
      <html>
        <head><title>Cookie Policy - VPoll</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Cookie Policy</h1>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>What are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit our website.</p>
          
          <h2>Types of Cookies We Use</h2>
          
          <h3>Essential Cookies (Always Active)</h3>
          <ul>
            <li><strong>Authentication:</strong> Keep you logged in securely</li>
            <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
            <li><strong>Functionality:</strong> Remember your preferences and settings</li>
          </ul>
          
          <h3>Functional Cookies (Optional)</h3>
          <ul>
            <li><strong>Language Preferences:</strong> Remember your language choice</li>
            <li><strong>Accessibility:</strong> Store accessibility preferences</li>
          </ul>
          
          <h3>Analytics Cookies (Optional)</h3>
          <ul>
            <li><strong>Usage Analytics:</strong> Help us understand how the platform is used</li>
            <li><strong>Performance Monitoring:</strong> Monitor platform performance and errors</li>
          </ul>
          
          <h3>Marketing Cookies (Optional)</h3>
          <ul>
            <li><strong>Advertising:</strong> Show relevant advertisements</li>
            <li><strong>Social Media:</strong> Integration with social media platforms</li>
          </ul>
          
          <h2>Managing Cookies</h2>
          <p>You can manage your cookie preferences through our consent banner or privacy settings.</p>
          
          <p><em>This is a sample cookie policy for development purposes.</em></p>
        </body>
      </html>
    `;
  }
} 