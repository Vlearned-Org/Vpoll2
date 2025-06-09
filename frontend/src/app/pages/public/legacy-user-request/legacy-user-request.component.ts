import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface LegacyUserRequestDto {
  name: string;
  nric: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonRelation?: string;
  preferredContactMethod: 'email' | 'in_person';
  requestType: 'new_account' | 'password_reset';
  visitLocation?: string;
  visitDate?: string;
  assistedBy?: string;
  isWalkIn?: boolean;
}

@Component({
  selector: 'app-legacy-user-request',
  templateUrl: './legacy-user-request.component.html',
  styleUrls: ['./legacy-user-request.component.scss'],
})
export class LegacyUserRequestComponent implements OnInit {
  public requestForm: FormGroup;
  public loading = false;
  public submitted = false;

  // NRIC validation
  private nricValidationSubject = new Subject<string>();
  public nricValidationLoading = false;
  public nricValidationMessage = '';

  public requestTypes = [
    { label: 'Create New Account', value: 'new_account' },
    { label: 'Reset Password', value: 'password_reset' }
  ];

  public contactMethods = [
    { label: 'Email (through contact person) - For OTP and notifications', value: 'email' },
    { label: 'In-Person Visit - I will visit the office', value: 'in_person' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private authHttpService: AuthHttpService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupNricValidation();
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nric: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{8,12}$/)]],
      contactPersonName: [''],

      contactPersonEmail: ['', [Validators.email]],
      contactPersonRelation: [''],
      preferredContactMethod: ['email', Validators.required],
      requestType: ['new_account', Validators.required],
      visitLocation: [''],
      visitDate: [''],
      assistedBy: [''],
      isWalkIn: [false]
    });

    this.requestForm.get('preferredContactMethod').valueChanges.subscribe(method => {
      this.updateValidators(method);
    });

    // Setup NRIC validation
    this.requestForm.get('nric').valueChanges.subscribe(value => {
      if (value && value.length >= 3) {
        this.nricValidationSubject.next(value);
      } else {
        this.nricValidationMessage = '';
      }
    });
  }

  private updateValidators(contactMethod: string): void {
    const contactPersonNameControl = this.requestForm.get('contactPersonName');
    const contactPersonEmailControl = this.requestForm.get('contactPersonEmail');
    const visitLocationControl = this.requestForm.get('visitLocation');
    const visitDateControl = this.requestForm.get('visitDate');

    contactPersonNameControl.clearValidators();
    contactPersonEmailControl.clearValidators();
    visitLocationControl.clearValidators();
    visitDateControl.clearValidators();

    contactPersonEmailControl.setValidators([Validators.email]);

    switch (contactMethod) {
      case 'email':
        contactPersonNameControl.setValidators([Validators.required]);
        contactPersonEmailControl.setValidators([
          Validators.required,
          Validators.email
        ]);
        break;
      case 'in_person':
        visitLocationControl.setValidators([Validators.required]);
        visitDateControl.setValidators([Validators.required]);
        this.requestForm.get('isWalkIn').setValue(true);
        break;
    }

    contactPersonNameControl.updateValueAndValidity();
    contactPersonEmailControl.updateValueAndValidity();
    visitLocationControl.updateValueAndValidity();
    visitDateControl.updateValueAndValidity();
  }

  public onNricChange(event: any): void {
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    this.requestForm.get('nric').setValue(value);
  }

  public onNameChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.requestForm.get('name').setValue(value);
  }

  public onContactNameChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.requestForm.get('contactPersonName').setValue(value);
  }

  public submitRequest(): void {
    if (!this.requestForm.valid) {
      this.markFormGroupTouched(this.requestForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    // Check for NRIC validation errors
    if (this.requestForm.get('nric').hasError('nricExists')) {
      this.messageService.add({
        severity: 'error',
        summary: 'NRIC Already Registered',
        detail: this.nricValidationMessage
      });
      return;
    }

    this.loading = true;
    const requestData: LegacyUserRequestDto = this.requestForm.value;

    this.authHttpService.submitLegacyUserRequest(requestData).subscribe(
      (response) => {
        this.loading = false;
        this.submitted = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Request Submitted',
          detail: 'Your request has been submitted successfully. Our admin team will contact you within 2 business days.'
        });
      },
      (error) => {
        this.loading = false;
        // Handle NRIC conflict errors specifically
        if (error.error && error.error.message && error.error.message.includes('NRIC') && error.error.message.includes('already registered')) {
          this.requestForm.get('nric').setErrors({ nricExists: true });
          this.nricValidationMessage = error.error.message;
          this.messageService.add({
            severity: 'error',
            summary: 'NRIC Already Registered',
            detail: error.error.message
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Submission Failed',
            detail: error.error?.message || error.message || 'Failed to submit request. Please try again.'
          });
        }
      }
    );
  }

  public resetForm(): void {
    this.submitted = false;
    this.requestForm.reset();
    this.nricValidationMessage = '';
    this.initializeForm();
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }

  public goToSignup(): void {
    this.router.navigate(['/sign-up']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  public getFieldError(fieldName: string): string {
    const field = this.requestForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['nricExists']) return this.nricValidationMessage;
      if (field.errors['pattern']) {
        if (fieldName === 'nric') return 'NRIC should be 8-12 alphanumeric characters';
      }
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels = {
      name: 'Name',
      nric: 'NRIC',
      contactPersonName: 'Contact Person Name',
      contactPersonEmail: 'Contact Person Email',
      contactPersonRelation: 'Relationship',
      preferredContactMethod: 'Preferred Contact Method',
      requestType: 'Request Type',
      visitLocation: 'Visit Location',
      visitDate: 'Visit Date',
      assistedBy: 'Assisted By'
    };
    return labels[fieldName] || fieldName;
  }

  public get showContactPersonFields(): boolean {
    const method = this.requestForm.get('preferredContactMethod')?.value;
    return method === 'email';
  }

  public get showInPersonFields(): boolean {
    return this.requestForm.get('preferredContactMethod')?.value === 'in_person';
  }

  public get isFormValid(): boolean {
    return this.requestForm.valid;
  }

  public getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private setupNricValidation(): void {
    this.nricValidationSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(nric => {
        this.nricValidationLoading = true;
        this.nricValidationMessage = '';
        return this.authHttpService.checkNricExists(nric);
      })
    ).subscribe(
      (response) => {
        this.nricValidationLoading = false;
        if (response.exists) {
          this.nricValidationMessage = `NRIC ${response.nric} is already registered. If this is your account, please use the login page or password reset option.`;
          this.requestForm.get('nric').setErrors({ nricExists: true });
        } else {
          this.nricValidationMessage = '';
          const currentErrors = this.requestForm.get('nric').errors;
          if (currentErrors && currentErrors['nricExists']) {
            delete currentErrors['nricExists'];
            const hasOtherErrors = Object.keys(currentErrors).length > 0;
            this.requestForm.get('nric').setErrors(hasOtherErrors ? currentErrors : null);
          }
        }
      },
      (error) => {
        this.nricValidationLoading = false;
        console.error('NRIC validation error:', error);
      }
    );
  }
}