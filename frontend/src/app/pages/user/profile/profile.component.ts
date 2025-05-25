import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import {
  AccountVerificationStatusEnum,
  InternalFile,
  RichInternalFile,
  User,
} from '@vpoll-shared/contract';
import { MessageService, ConfirmationService } from 'primeng/api';

export interface CountryCode {
  name: string;
  code: string;
  flag: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public profileForm: FormGroup;
  public passwordForm: FormGroup;
  public user: User;
  public identityDocument: InternalFile;
  public loading = false;
  public passwordLoading = false;
  public countryCodes: CountryCode[];
  public showPasswordSection = false;
  public AccountVerificationStatusEnum = AccountVerificationStatusEnum;

  // OTP verification for sensitive changes
  public showOtpVerification = false;
  public otpForm: FormGroup;
  public pendingChanges: any = null;
  public otpLoading = false;

  constructor(
    private fb: FormBuilder,
    private me: MeHttpService,
    private auth: AuthHttpService,
    private messageSvc: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeCountryCodes();
    this.initializeForms();
    this.loadUserData();
  }

  private initializeCountryCodes(): void {
    this.countryCodes = [
      { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
      { name: 'Singapore', code: '+65', flag: '🇸🇬' },
      { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
      { name: 'Thailand', code: '+66', flag: '🇹🇭' },
      { name: 'Philippines', code: '+63', flag: '🇵🇭' },
      { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
    ];
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]], // Remove required validator - email can be optional initially
      nric: [''], // Will be set conditionally based on admin status
      countryCode: ['+60', Validators.required],
      mobileNumber: ['', [Validators.pattern(/^[0-9]+$/)]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this.passwordMatchValidator
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  public loadUserData(): void {
    this.me.getMe().subscribe((user) => {
      this.user = user;
      this.identityDocument = user.nricRef;
      
      // Set NRIC validators based on admin status
      this.updateNricValidators();
      
      // Parse mobile number into country code and number
      let countryCode = '+60';
      let mobileNumber = '';
      
      if (user.mobile) {
        const mobileMatch = user.mobile.match(/^(\+\d{2,3})(.*)$/);
        if (mobileMatch) {
          countryCode = mobileMatch[1];
          mobileNumber = mobileMatch[2];
        } else {
          mobileNumber = user.mobile;
        }
      }

      this.profileForm.patchValue({
        name: user.name || '',
        email: user.email || '',
        nric: user.nric || '',
        countryCode: countryCode,
        mobileNumber: mobileNumber,
      });
    });
  }

  private updateNricValidators(): void {
    const nricControl = this.profileForm.get('nric');
    if (this.user?.isAdmin) {
      // For admin users, NRIC is optional
      nricControl?.clearValidators();
    } else {
      // For regular users, NRIC is required
      nricControl?.setValidators([Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]);
    }
    nricControl?.updateValueAndValidity();
  }

  public onNricChange(event: any): void {
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    this.profileForm.get('nric').setValue(value);
  }

  public onNameChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.profileForm.get('name').setValue(value);
  }

  public onEmailChange(event: any): void {
    const value = event.target.value.toLowerCase();
    this.profileForm.get('email').setValue(value);
  }

  public addIdentityDocument(file: RichInternalFile): void {
    this.identityDocument = file;
  }

  public removeIdentityDocument(): void {
    this.identityDocument = null;
  }

  public updateProfile(): void {
    if (!this.profileForm.valid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    const formValue = this.profileForm.value;
    const hasSignificantChanges = this.hasSignificantChanges(formValue);

    if (hasSignificantChanges) {
      // Require OTP verification for significant changes
      this.requestOtpForProfileUpdate(formValue);
    } else {
      // Allow minor changes without OTP
      this.submitProfileUpdate(formValue);
    }
  }

  private hasSignificantChanges(formValue: any): boolean {
    // Check if NRIC or email changed (significant changes requiring verification)
    // Also consider it significant if user is adding an email for the first time
    // For admin users, NRIC changes are not considered significant
    const nricChanged = !this.user?.isAdmin && formValue.nric !== this.user.nric;
    return (
      nricChanged ||
      formValue.email !== this.user.email ||
      (!this.user.email && formValue.email) // Adding email for the first time
    );
  }

  private requestOtpForProfileUpdate(formValue: any): void {
    // If user doesn't have an email and is adding one, use the new email
    // Otherwise use the existing email
    const emailForOtp = (!this.user.email && formValue.email) ? formValue.email : this.user.email;
    
    if (!emailForOtp) {
      this.messageSvc.add({
        key: 'toast',
        severity: 'error',
        summary: 'Email Required',
        detail: 'Please enter an email address to receive the verification code.',
      });
      return;
    }

    this.auth.emailOtpValidation({
      email: emailForOtp,
      isNewUser: false,
    }).subscribe(
      () => {
        this.pendingChanges = formValue;
        this.showOtpVerification = true;
        this.messageSvc.add({
          key: 'toast',
          severity: 'info',
          summary: 'OTP Sent',
          detail: `Please check ${emailForOtp} for the verification code.`,
        });
      },
      (error) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          summary: 'OTP Request Failed',
          detail: error.message || 'Failed to send OTP',
        });
      }
    );
  }

  public verifyOtpAndUpdate(): void {
    if (!this.otpForm.valid) {
      return;
    }

    this.otpLoading = true;
    const otp = this.otpForm.get('otp').value;
    
    // Combine pending changes with OTP
    const updateData = {
      ...this.prepareUpdateData(this.pendingChanges),
      otp: otp,
    };

    this.me.updatePersonalInfo(updateData).subscribe(
      (user) => {
        this.otpLoading = false;
        this.showOtpVerification = false;
        this.pendingChanges = null;
        this.otpForm.reset();
        
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Your profile has been updated successfully.',
        });
        
        this.loadUserData();
      },
      (error) => {
        this.otpLoading = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          summary: 'Update Failed',
          detail: error.message || 'Failed to update profile',
        });
      }
    );
  }

  private submitProfileUpdate(formValue: any): void {
    this.loading = true;
    const updateData = this.prepareUpdateData(formValue);

    this.me.updatePersonalInfo(updateData).subscribe(
      (user) => {
        this.loading = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Your profile has been updated successfully.',
        });
        this.loadUserData();
      },
      (error) => {
        this.loading = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          summary: 'Update Failed',
          detail: error.message || 'Failed to update profile',
        });
      }
    );
  }

  private prepareUpdateData(formValue: any): any {
    let fullMobileNumber: string | null = null;

    if (formValue.mobileNumber && formValue.countryCode) {
      const nationalNumber = formValue.mobileNumber.replace(/^0+/, '');
      fullMobileNumber = `${formValue.countryCode}${nationalNumber}`;
    }

    const updateData: any = {
      name: formValue.name,
      email: formValue.email,
      mobile: fullMobileNumber,
    };

    // Only include NRIC and identity document for non-admin users
    if (!this.user?.isAdmin) {
      updateData.identity = formValue.nric;
      updateData.identityDocument = this.identityDocument?._id;
    }

    return updateData;
  }

  public updatePassword(): void {
    if (!this.passwordForm.valid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to change your password?',
      header: 'Confirm Password Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitPasswordUpdate();
      },
    });
  }

  private submitPasswordUpdate(): void {
    this.passwordLoading = true;
    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword').value,
      newPassword: this.passwordForm.get('newPassword').value,
    };

    this.auth.changePassword(passwordData).subscribe(
      () => {
        this.passwordLoading = false;
        this.passwordForm.reset();
        this.showPasswordSection = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Password Updated',
          detail: 'Your password has been changed successfully.',
        });
      },
      (error) => {
        this.passwordLoading = false;
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          summary: 'Password Update Failed',
          detail: error.message || 'Failed to update password',
        });
      }
    );
  }

  public cancelOtpVerification(): void {
    this.showOtpVerification = false;
    this.pendingChanges = null;
    this.otpForm.reset();
  }

  public resendOtp(): void {
    if (this.user.email) {
      this.auth.emailOtpValidation({
        email: this.user.email,
        isNewUser: false,
      }).subscribe(
        () => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'info',
            summary: 'OTP Resent',
            detail: 'A new verification code has been sent to your email.',
          });
        },
        (error) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'error',
            summary: 'Resend Failed',
            detail: error.message || 'Failed to resend OTP',
          });
        }
      );
    }
  }

  public resubmitForVerification(): void {
    // Skip document check for admin users
    if (!this.user?.isAdmin && !this.identityDocument?._id) {
      this.messageSvc.add({
        key: 'toast',
        severity: 'error',
        summary: 'Document Required',
        detail: 'Please upload your NRIC/Passport document.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'This will reset your verification status to pending. Continue?',
      header: 'Resubmit for Verification',
      icon: 'pi pi-question-circle',
      accept: () => {
        const formValue = this.profileForm.value;
        const updateData = this.prepareUpdateData(formValue);
        
        this.me.updatePersonalInfo(updateData).subscribe(
          () => {
            this.messageSvc.add({
              key: 'toast',
              severity: 'success',
              summary: 'Resubmitted',
              detail: 'Your profile has been resubmitted for verification.',
            });
            this.loadUserData();
          },
          (error) => {
            this.messageSvc.add({
              key: 'toast',
              severity: 'error',
              summary: 'Resubmission Failed',
              detail: error.message || 'Failed to resubmit profile',
            });
          }
        );
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  public getFieldError(fieldName: string, formGroup: FormGroup = this.profileForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) {
        if (fieldName === 'nric') return 'NRIC should contain only letters and numbers';
        if (fieldName === 'newPassword') return 'Password must contain at least 8 characters with uppercase, lowercase, and number';
        if (fieldName === 'mobileNumber') return 'Mobile number should contain only numbers';
        if (fieldName === 'otp') return 'OTP must be 6 digits';
      }
      if (field.errors['minLength']) return `${fieldName} is too short`;
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  public get isProfileFormValid(): boolean {
    // Profile is valid if basic required fields are filled
    // Email is not required but if provided, must be valid
    const nameValid = this.profileForm.get('name').valid;
    const nricValid = this.user?.isAdmin ? true : this.profileForm.get('nric').valid; // NRIC not required for admins
    const emailValid = !this.profileForm.get('email').value || this.profileForm.get('email').valid;
    return nameValid && nricValid && emailValid;
  }

  public get isPasswordFormValid(): boolean {
    return this.passwordForm.valid;
  }

  public get canUpdateProfile(): boolean {
    return this.isProfileFormValid && !this.loading;
  }

  public get canUpdatePassword(): boolean {
    return this.passwordForm.valid && !this.passwordLoading;
  }

  public navigateBack(): void {
    this.router.navigate(['/home']);
  }
}