import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { CountryMobileCodes } from '@app/shared/mobile-country-code';
import { isMobilePhone } from 'class-validator';
import { Message, MessageService } from 'primeng/api';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  public step: 'request-otp' | 'verify-otp' | 'reset-password';
  public messages: Message[] = [];
  // Step 1: Request for mobile otp
  public countryMobileCode = CountryMobileCodes;
  public selectedCountryMobileCode = this.countryMobileCode[0];
  public mobileNumber: string = '';
  // Step 2: Verify OTP
  public internalMobile: string;
  public otp: string;
  // Step 3: Reset password
  public resetPasswordForm: FormGroup;

  constructor(
    public router: Router,
    private auth: AuthHttpService,
    private fb: FormBuilder,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.step = 'request-otp';
    this.resetPasswordForm = this.fb.group({
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
      token: [null, Validators.required],
    });
  }

  public requestOTP(): void {
    this.auth
      .mobileOtpValidation({
        mobile: this.mobile,
        isNewUser: false,
      })
      .subscribe(
        (response) => {
          this.step = 'verify-otp';
          this.internalMobile = response.mobile;
        },
        (err) => {
          if (err.code === 'USER_NOT_FOUND') {
            this.messages = [];
            this.messages.push({
              severity: 'error',

              detail: err.message,
            });
          }
        }
      );
  }

  public verifyOTP(): void {
    this.auth
      .userForgetPassword({
        mobile: this.internalMobile,
        otp: this.otp,
      })
      .subscribe(
        (response) => {
          this.step = 'reset-password';
          this.resetPasswordForm.get('token').patchValue(response.token);
        },
        (err) => {}
      );
  }

  public resetPassword(): void {
    this.auth.userResetPassword(this.resetPasswordForm.value).subscribe(
      (response) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Password reset successful',
        });
        this.router.navigate(['login']);
      },
      (err) => {}
    );
  }

  public isValidMobile() {
    return isMobilePhone(this.mobile.replace(/\D/g, ''));
  }

  public get resetPasswordValid(): boolean {
    return (
      this.resetPasswordForm.valid &&
      this.resetPasswordForm.get('password').value ===
        this.resetPasswordForm.get('confirmPassword').value
    );
  }

  public get mobile() {
    return `${this.selectedCountryMobileCode.name}${this.mobileNumber}`.replace(
      /\D/g,
      ''
    );
  }
}
