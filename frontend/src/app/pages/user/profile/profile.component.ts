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
      { name: 'China', code: '+86', flag: '🇨🇳' },
      { name: 'United States', code: '+1', flag: '🇺🇸' },
      { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    ];
    
    // Sort by code length (longest first) for better parsing
    this.countryCodes.sort((a, b) => b.code.length - a.code.length);
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]], // Remove required validator - email can be optional initially
      nric: [''], // Will be set conditionally based on admin status
      countryCode: ['+60', Validators.required],
      mobileNumber: [''],
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
        console.log('Parsing mobile number:', user.mobile);
        
        // First check if mobile starts with + prefix
        if (user.mobile.startsWith('+')) {
          const mobileMatch = user.mobile.match(/^(\+\d{1,4})(.*)$/);
          if (mobileMatch) {
            const parsedCountryCode = mobileMatch[1];
            const parsedMobileNumber = mobileMatch[2];
            
            // Check if the parsed country code exists in our countryCodes array
            const foundCountry = this.countryCodes.find(country => country.code === parsedCountryCode);
            if (foundCountry) {
              countryCode = parsedCountryCode;
              mobileNumber = parsedMobileNumber;
              console.log('Found country code with +:', countryCode, 'Number:', mobileNumber);
            } else {
              // If country code not found, treat entire mobile as number with default country code
              mobileNumber = user.mobile.replace(/^\+/, '');
              console.log('Country code not found, using default. Number:', mobileNumber);
            }
          }
        } else {
          // Handle numbers without + prefix - try to extract country code
          let foundCountryCode = null;
          
          // Check for country codes at the start of the number (sorted by length, longest first)
          for (const country of this.countryCodes) {
            const codeWithoutPlus = country.code.replace('+', '');
            if (user.mobile.startsWith(codeWithoutPlus)) {
              foundCountryCode = country.code;
              mobileNumber = user.mobile.substring(codeWithoutPlus.length);
              console.log('Found country code without +:', foundCountryCode, 'Number:', mobileNumber);
              break;
            }
          }
          
          if (foundCountryCode) {
            countryCode = foundCountryCode;
          } else {
            // If no country code found, treat entire mobile as number with default country code
            mobileNumber = user.mobile;
            console.log('No country code found, using default +60. Number:', mobileNumber);
          }
        }
        
        console.log('Final parsed - Country Code:', countryCode, 'Mobile Number:', mobileNumber);
      }

      this.profileForm.patchValue({
        name: user.name || '',
        email: user.email || '',
        nric: user.nric || '',
        countryCode: countryCode,
        mobileNumber: mobileNumber,
      });
      
      // Force update the form to ensure dropdown displays correctly
      this.profileForm.updateValueAndValidity();
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
      console.log('Form validation errors:', this.profileForm.errors);
      console.log('Mobile field errors:', this.profileForm.get('mobileNumber')?.errors);
      return;
    }

    const formValue = this.profileForm.value;
    console.log('Form values before update:', formValue);
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
    // Mobile-only changes don't require OTP verification
    const nricChanged = !this.user?.isAdmin && formValue.nric !== this.user.nric;
    const emailChanged = formValue.email !== this.user.email;
    const addingEmail = !this.user.email && formValue.email;
    
    console.log('Checking significant changes:', {
      nricChanged,
      emailChanged,
      addingEmail,
      oldEmail: this.user.email,
      newEmail: formValue.email
    });
    
    return (
      nricChanged ||
      emailChanged ||
      addingEmail // Adding email for the first time
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
        
        // Update the local user object instead of reloading to prevent form reset
        this.user = user;
        this.identityDocument = user.nricRef;
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
        // Update the local user object instead of reloading to prevent form reset
        this.user = user;
        this.identityDocument = user.nricRef;
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

    console.log('Preparing update data with form value:', formValue);

    if (formValue.mobileNumber && formValue.countryCode) {
      // Clean the mobile number: remove any leading zeros, spaces, and non-digits
      const cleanMobileNumber = formValue.mobileNumber.replace(/^0+/, '').replace(/\D/g, '');
      if (cleanMobileNumber) {
        // Store without the + prefix to match database format
        const countryCodeDigits = formValue.countryCode.replace('+', '');
        fullMobileNumber = `${countryCodeDigits}${cleanMobileNumber}`;
      }
      console.log('Constructed mobile number:', fullMobileNumber);
    } else if (formValue.mobileNumber && !formValue.countryCode) {
      // If only mobile number provided, clean it
      fullMobileNumber = formValue.mobileNumber.replace(/\D/g, '');
      console.log('Mobile without country code:', fullMobileNumber);
    } else if (!formValue.mobileNumber || formValue.mobileNumber.trim() === '') {
      // User wants to clear mobile number
      fullMobileNumber = null;
      console.log('Clearing mobile number');
    } else {
      console.log('No mobile number provided or incomplete');
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

    console.log('Final update data:', updateData);
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
        if (fieldName === 'mobileNumber') return 'Mobile number format is invalid';
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
    const mobileValid = !this.profileForm.get('mobileNumber').value || this.profileForm.get('mobileNumber').valid;
    return nameValid && nricValid && emailValid && mobileValid;
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