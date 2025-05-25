import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';

export interface LegacyUserRequestDto {
  name: string;
  nric: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  contactPersonRelation?: string;
  physicalAddress?: string;
  preferredContactMethod: 'phone' | 'email' | 'postal' | 'in_person';
  requestType: 'new_account' | 'password_reset' | 'access_help' | 'walk_in_account' | 'other';
  message: string;
  eventName?: string;
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

  public requestTypes = [
    { label: 'Create New Account', value: 'new_account' },
    { label: 'Reset Password', value: 'password_reset' },
    { label: 'Access Help', value: 'access_help' },
    { label: 'Walk-in Account Creation', value: 'walk_in_account' },
    { label: 'Other', value: 'other' }
  ];

  public contactMethods = [
    { label: 'Phone (through contact person) - Admin will call', value: 'phone' },
    { label: 'Email (through contact person) - For OTP and notifications', value: 'email' },
    { label: 'Postal Mail', value: 'postal' },
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
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nric: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{8,12}$/)]],
      contactPersonName: [''],
      contactPersonPhone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      contactPersonEmail: ['', [Validators.email]],
      contactPersonRelation: [''],
      physicalAddress: [''],
      preferredContactMethod: ['email', Validators.required],
      requestType: ['new_account', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      eventName: [''],
      visitLocation: [''],
      visitDate: [''],
      assistedBy: [''],
      isWalkIn: [false]
    });

    this.requestForm.get('preferredContactMethod').valueChanges.subscribe(method => {
      this.updateValidators(method);
    });
  }

  private updateValidators(contactMethod: string): void {
    const contactPersonNameControl = this.requestForm.get('contactPersonName');
    const contactPersonPhoneControl = this.requestForm.get('contactPersonPhone');
    const contactPersonEmailControl = this.requestForm.get('contactPersonEmail');
    const physicalAddressControl = this.requestForm.get('physicalAddress');
    const visitLocationControl = this.requestForm.get('visitLocation');
    const visitDateControl = this.requestForm.get('visitDate');

    contactPersonNameControl.clearValidators();
    contactPersonPhoneControl.clearValidators();
    contactPersonEmailControl.clearValidators();
    physicalAddressControl.clearValidators();
    visitLocationControl.clearValidators();
    visitDateControl.clearValidators();

    contactPersonPhoneControl.setValidators([Validators.pattern(/^\+?[0-9]{8,15}$/)]);
    contactPersonEmailControl.setValidators([Validators.email]);

    switch (contactMethod) {
      case 'phone':
        contactPersonNameControl.setValidators([Validators.required]);
        contactPersonPhoneControl.setValidators([
          Validators.required,
          Validators.pattern(/^\+?[0-9]{8,15}$/)
        ]);
        contactPersonEmailControl.setValidators([
          Validators.required,
          Validators.email
        ]);
        break;
      case 'email':
        contactPersonNameControl.setValidators([Validators.required]);
        contactPersonEmailControl.setValidators([
          Validators.required,
          Validators.email
        ]);
        break;
      case 'postal':
        physicalAddressControl.setValidators([Validators.required]);
        break;
      case 'in_person':
        visitLocationControl.setValidators([Validators.required]);
        visitDateControl.setValidators([Validators.required]);
        this.requestForm.get('isWalkIn').setValue(true);
        break;
    }

    contactPersonNameControl.updateValueAndValidity();
    contactPersonPhoneControl.updateValueAndValidity();
    contactPersonEmailControl.updateValueAndValidity();
    physicalAddressControl.updateValueAndValidity();
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
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Failed',
          detail: error.message || 'Failed to submit request. Please try again.'
        });
      }
    );
  }

  public resetForm(): void {
    this.submitted = false;
    this.requestForm.reset();
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
      if (field.errors['pattern']) {
        if (fieldName === 'nric') return 'NRIC should be 8-12 alphanumeric characters';
        if (fieldName.includes('Phone')) return 'Please enter a valid phone number';
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
      contactPersonPhone: 'Contact Person Phone',
      contactPersonEmail: 'Contact Person Email',
      contactPersonRelation: 'Relationship',
      physicalAddress: 'Physical Address',
      preferredContactMethod: 'Preferred Contact Method',
      requestType: 'Request Type',
      message: 'Message',
      eventName: 'Event Name',
      visitLocation: 'Visit Location',
      visitDate: 'Visit Date',
      assistedBy: 'Assisted By'
    };
    return labels[fieldName] || fieldName;
  }

  public get showContactPersonFields(): boolean {
    const method = this.requestForm.get('preferredContactMethod')?.value;
    return method === 'phone' || method === 'email';
  }

  public get showPhysicalAddress(): boolean {
    return this.requestForm.get('preferredContactMethod')?.value === 'postal';
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
}