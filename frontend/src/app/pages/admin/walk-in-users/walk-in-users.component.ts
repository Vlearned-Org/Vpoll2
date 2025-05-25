import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserHttpService } from '@app/shared/http-services/user-http.service';

@Component({
  selector: 'app-walk-in-users',
  templateUrl: './walk-in-users.component.html',
  styleUrls: ['./walk-in-users.component.scss']
})
export class WalkInUsersComponent implements OnInit {
  public createForm: FormGroup;
  public loading = false;
  public createdUser: any = null;
  public temporaryPassword: string = '';
  public stats: any = null;
  public showPassword = false;

  public locations = [
    { label: 'Main Office', value: 'main_office' },
    { label: 'Regional Office - North', value: 'regional_north' },
    { label: 'Regional Office - South', value: 'regional_south' },
    { label: 'Service Center', value: 'service_center' },
    { label: 'Other', value: 'other' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private userHttpService: UserHttpService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStats();
  }

  private initializeForm(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nric: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{8,12}$/)]],
      visitLocation: ['main_office', Validators.required],
      assistedBy: [''],
      adminNotes: [''],
      email: ['', [Validators.email]],
      mobile: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]]
    });
  }

  public onNricChange(event: any): void {
    const value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    this.createForm.get('nric')?.setValue(value);
  }

  public onNameChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.createForm.get('name')?.setValue(value);
  }

  public createWalkInUser(): void {
    if (!this.createForm.valid) {
      this.markFormGroupTouched(this.createForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    this.loading = true;
    const userData = this.createForm.value;

    this.userHttpService.createWalkInUser(userData).subscribe(
      (response) => {
        this.loading = false;
        this.createdUser = response.user;
        this.temporaryPassword = response.temporaryPassword;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Account Created',
          detail: 'Walk-in user account created successfully!'
        });

        this.loadStats();
      },
      (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: error.message || 'Failed to create account. Please try again.'
        });
      }
    );
  }

  public resetForm(): void {
    this.createdUser = null;
    this.temporaryPassword = '';
    this.createForm.reset();
    this.initializeForm();
  }

  public copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    });
  }

  public printCredentials(): void {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>User Credentials - ${this.createdUser.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .credentials { border: 2px solid #ccc; padding: 20px; margin: 20px 0; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>VPoll User Account Credentials</h2>
            <p>Created: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="credentials">
            <div class="field">
              <span class="label">Name:</span> ${this.createdUser.name}
            </div>
            <div class="field">
              <span class="label">NRIC:</span> ${this.createdUser.nric}
            </div>
            <div class="field">
              <span class="label">Login Username:</span> ${this.createdUser.nric}
            </div>
            <div class="field">
              <span class="label">Temporary Password:</span> ${this.temporaryPassword}
            </div>
            <div class="field">
              <span class="label">Email:</span> ${this.createdUser.email}
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Important:</strong> Please change your password after first login.</p>
            <p>For assistance, contact VPoll support.</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow?.document.write(content);
    printWindow?.document.close();
    printWindow?.print();
  }

  private loadStats(): void {
    this.userHttpService.getWalkInStats().subscribe(
      (stats) => {
        this.stats = stats;
      },
      (error) => {
        console.error('Failed to load walk-in stats:', error);
      }
    );
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  public getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) {
        if (fieldName === 'nric') return 'NRIC should be 8-12 alphanumeric characters';
        if (fieldName === 'mobile') return 'Please enter a valid phone number';
      }
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels = {
      name: 'Name',
      nric: 'NRIC',
      visitLocation: 'Visit Location',
      assistedBy: 'Assisted By',
      adminNotes: 'Admin Notes',
      email: 'Email',
      mobile: 'Mobile'
    };
    return labels[fieldName] || fieldName;
  }

  public get isFormValid(): boolean {
    return this.createForm.valid;
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}