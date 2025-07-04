import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { Message, MessageService } from 'primeng/api';
import { ConsentRecord } from '@app/shared/components/consent-form/consent-form.component';

export interface CountryCode {
  name: string;
  code: string;
  flag: string; // Placeholder for flag icon class or image path
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  public messages: Message[] = [];
  public signUpForm: FormGroup;
  public countryCodes: CountryCode[];
  public selectedCountryCode: CountryCode;
  public consentGiven = false;
  public consentRecords: ConsentRecord[] = [];
  public loading = false;

  constructor(
    public router: Router,
    private auth: AuthHttpService,
    private fb: FormBuilder,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.countryCodes = [
      { name: 'Malaysia', code: '+60', flag: '🇲🇾' }, // Placeholder flag
      { name: 'Singapore', code: '+65', flag: '🇸🇬' }, // Placeholder flag
      { name: 'Indonesia', code: '+62', flag: '🇮🇩' }  // Placeholder flag
    ];
    // Set a default country code if desired, e.g., Malaysia
    this.selectedCountryCode = this.countryCodes[0];

    this.signUpForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      confirmEmail: [null, [Validators.required, Validators.email]],
      name: [null, Validators.required],
      nric: [null, Validators.required],
      countryCode: [this.selectedCountryCode.code, Validators.required], // Add countryCode control
      mobileNumber: [null, [Validators.pattern('^[0-9]+$')]], // Add mobileNumber control for national part, optional
      password: [
        null,
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}'),
        ],
      ],
      confirmPassword: [
        null,
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}'),
        ],
      ],
    });
  }



  public signUp(): void {
    // Mark all fields as touched to trigger validation display
    this.signUpForm.markAllAsTouched();
    
    if (!this.signUpValid) {
      this.messageSvc.add({
        key: 'toast',
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix all form errors and provide consent before proceeding',
      });
      return;
    }

    this.loading = true;
    const formRawValue = this.signUpForm.getRawValue();
    let fullMobileNumber: string | null = null;

    if (formRawValue.mobileNumber && formRawValue.countryCode) {
      // Remove leading zeros from national part if any, as country code is present
      const nationalNumber = formRawValue.mobileNumber.replace(/^0+/, '');
      fullMobileNumber = `${formRawValue.countryCode}${nationalNumber}`;
    }

    const payload = {
      ...formRawValue,
      mobile: fullMobileNumber, // Set the constructed mobile number
      consents: this.consentRecords // Include consent records
    };

    // Remove individual mobile parts from payload if they exist to avoid backend confusion
    delete payload.countryCode;
    delete payload.mobileNumber;
    delete payload.confirmEmail;

    this.auth.userSignUp(payload).subscribe(
      (response) => {
        this.loading = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Account Created Successfully',
          detail: 'Please check your email for verification instructions.',
        });
        this.router.navigate(['login']);
      },
      (err) => {
        this.loading = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          summary: 'Sign up failed',
          detail: err.error?.message || 'An unexpected error occurred.',
        });
      }
    );
  }

  public get signUpValid(): boolean {
    return (
      this.signUpForm.valid &&
      this.signUpForm.get('password').value ===
        this.signUpForm.get('confirmPassword').value &&
      this.signUpForm.get('email').value ===
        this.signUpForm.get('confirmEmail').value &&
      this.consentGiven
    );
  }

  public onConsentChange(consentData: {valid: boolean, consents: ConsentRecord[]}): void {
    this.consentGiven = consentData.valid;
    this.consentRecords = consentData.consents;
  }
}
