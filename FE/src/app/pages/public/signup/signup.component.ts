import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { CountryMobileCodes } from '@app/shared/mobile-country-code';
import { isMobilePhone } from 'class-validator';
import { Message, MessageService } from 'primeng/api';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  public step: 'request-otp' | 'verify-otp-register';
  public messages: Message[] = [];
  // Step 1: Request for mobile otp
  public countryMobileCode = CountryMobileCodes;
  public selectedCountryMobileCode = this.countryMobileCode[0];
  public mobileNumber: string = '';
  // Step 2: Mobile Sign Up
  public internalMobile: string;
  public signUpForm: FormGroup;

  constructor(
    public router: Router,
    private auth: AuthHttpService,
    private fb: FormBuilder,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.step = 'request-otp';
    // this.step = 'verify-otp-register';
    this.signUpForm = this.fb.group({
      mobile: [null, Validators.required],
      name: [null, Validators.required],
      nric: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
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

  public requestOTP(): void {
    this.auth
      .mobileOtpValidation({
        mobile: this.mobile,
        isNewUser: true,
      })
      .subscribe(
        (response) => {
          this.internalMobile = response.mobile;
          this.signUpForm.get('mobile').patchValue(response.mobile);
          this.step = 'verify-otp-register';
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
    this.auth.userSignUp(this.signUpForm.value).subscribe(
      (response) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Successfully sign up as user',
        });
        this.router.navigate(['login']);
      },
      (err) => {}
    );
  }

  public isValidMobile() {
    return isMobilePhone(this.mobile.replace(/\D/g, ''));
  }

  public get signUpValid(): boolean {
    return (
      this.signUpForm.valid &&
      this.signUpForm.get('password').value ===
        this.signUpForm.get('confirmPassword').value
    );
  }

  public get mobile() {
    return `${this.selectedCountryMobileCode.name}${this.mobileNumber}`.replace(
      /\D/g,
      ''
    );
  }
}
