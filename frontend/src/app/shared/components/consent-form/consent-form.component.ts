import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-consent-form',
  templateUrl: './consent-form.component.html',
  styleUrls: ['./consent-form.component.scss']
})
export class ConsentFormComponent implements OnInit {
  @Input() consentType: 'signup' | 'login' = 'signup';
  @Output() consentChanged = new EventEmitter<boolean>();
  
  public consentForm: FormGroup;
  public showFullDetails = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.consentForm = this.fb.group({
      dataProcessingConsent: [false, Validators.requiredTrue],
      termsAndConditions: [false, Validators.requiredTrue]
    });

    // Emit consent status whenever form validity changes
    this.consentForm.valueChanges.subscribe(() => {
      this.consentChanged.emit(this.consentForm.valid);
    });
  }

  public get isConsentValid(): boolean {
    return this.consentForm.valid;
  }

  public toggleDetails(): void {
    this.showFullDetails = !this.showFullDetails;
  }

  public openTermsAndConditions(event: Event): void {
    event.preventDefault();
    // For now, we'll open an alert explaining that T&C are under development
    // In production, this would link to actual terms and conditions
    alert('Terms and Conditions: Our comprehensive terms and conditions are currently being finalized. By using this platform, you agree to comply with all applicable laws and regulations regarding electronic voting and data privacy. Full terms will be available at launch.');
  }

  public openPrivacyPolicy(event: Event): void {
    event.preventDefault();
    // For now, we'll open an alert explaining that Privacy Policy is under development
    // In production, this would link to actual privacy policy
    alert('Privacy Policy: We are committed to protecting your personal data in accordance with applicable privacy laws. Our detailed privacy policy is being finalized and will outline exactly how we collect, use, store, and protect your personal information. The full policy will be available at launch.');
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
} 