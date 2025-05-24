import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { Message, MessageService } from 'primeng/api';

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
  public step: 'request-email-otp' | 'verify-email-otp-register';
  public messages: Message[] = [];
  public emailAddress: string = '';

  public internalEmail: string;
  public signUpForm: FormGroup;
  public countryCodes: CountryCode[];
  public selectedCountryCode: CountryCode;

  constructor(
    public router: Router,
    private auth: AuthHttpService,
    private fb: FormBuilder,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.step = 'request-email-otp';

    this.countryCodes = [
      { name: 'Malaysia', code: '+60', flag: '🇲🇾' }, // Placeholder flag
      { name: 'Singapore', code: '+65', flag: '🇸🇬' }, // Placeholder flag
      { name: 'Indonesia', code: '+62', flag: '🇮🇩' }  // Placeholder flag
    ];
    // Set a default country code if desired, e.g., Malaysia
    this.selectedCountryCode = this.countryCodes[0];

    this.signUpForm = this.fb.group({
      email: [{ value: null, disabled: true }, [Validators.required, Validators.email]], // Keep email disabled after OTP
      name: [null, Validators.required],
      nric: [null, Validators.required],
      // mobile: [null], // Remove single mobile field
      countryCode: [this.selectedCountryCode.code, Validators.required], // Add countryCode control
      mobileNumber: [null, [Validators.pattern('^[0-9]+$')]], // Add mobileNumber control for national part, optional
      otp: [null, [Validators.required, Validators.pattern('[0-9]{6}')]],
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

  public requestEmailOTP(): void {
    this.auth
      .emailOtpValidation({
        email: this.emailAddress,
        isNewUser: true,
      })
      .subscribe(
        (response) => {
          this.internalEmail = response.email;
          this.signUpForm.get('email').patchValue(response.email); // Email is already disabled, patchValue is fine
          this.step = 'verify-email-otp-register';
        },
        (err) => {
          if (err.code === 'SIGNUP') {
            this.messages = [];
            this.messages.push({
              severity: 'error',
              detail: err.message,
            });
          }
        }
      );
  }

  public signUp(): void {
    if (!this.signUpValid) return; // Added guard based on existing getter

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
    };

    // Remove individual mobile parts from payload if they exist to avoid backend confusion
    delete payload.countryCode;
    delete payload.mobileNumber;

    this.auth.userSignUp(payload).subscribe(
      (response) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Successfully sign up as user',
        });
        this.router.navigate(['login']);
      },
      (err) => {
         this.messageSvc.add({ // Show error on sign up fail
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
        this.signUpForm.get('confirmPassword').value
    );
  }
}
