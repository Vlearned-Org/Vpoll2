import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserHttpService } from '@app/shared/http-services/user-http.service';
import { User, AccountVerificationStatusEnum } from '@vpoll-shared/contract';
import { UserStatusEnum } from '@vpoll-shared/enum';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-legacy-users',
  templateUrl: './legacy-users.component.html',
  styleUrls: ['./legacy-users.component.scss'],
})
export class LegacyUsersComponent implements OnInit {
  public users: User[] = [];
  public loading = true;
  public showCreateForm = false;
  public createUserForm: FormGroup;
  public editingUser: User = null;
  public AccountVerificationStatusEnum = AccountVerificationStatusEnum;
  public UserStatusEnum = UserStatusEnum;

  constructor(
    private userHttpService: UserHttpService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadLegacyUsers();
  }

  private initializeForm(): void {
    this.createUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nric: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{8,12}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.email]],
      mobile: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      fallbackContactName: [''],
      fallbackContactPhone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      fallbackContactEmail: ['', [Validators.email]],
      fallbackContactRelation: [''],
      physicalAddress: [''],
      requiresAssistedAccess: [false],
      specialInstructions: ['']
    });
  }

  private loadLegacyUsers(): void {
    this.loading = true;
    this.userHttpService.getLegacyUsers().subscribe(
      (users) => {
        this.users = users;
        this.loading = false;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Failed to load legacy users'
        });
        this.loading = false;
      }
    );
  }

  public createLegacyUser(): void {
    if (!this.createUserForm.valid) {
      this.markFormGroupTouched(this.createUserForm);
      return;
    }

    const userData = {
      ...this.createUserForm.value,
      isAdmin: false,
      status: UserStatusEnum.ACTIVE,
      accountVerificationStatus: AccountVerificationStatusEnum.APPROVED
    };

    this.userHttpService.createLegacyUser(userData).subscribe(
      (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Created',
          detail: `Legacy user ${user.name} created successfully`
        });
        this.loadLegacyUsers();
        this.cancelCreate();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: error.message || 'Failed to create legacy user'
        });
      }
    );
  }

  public editUser(user: User): void {
    this.editingUser = { ...user };
    this.createUserForm.patchValue({
      name: user.name || '',
      nric: user.nric || '',
      email: user.email || '',
      mobile: user.mobile || '',
      fallbackContactName: user.fallbackContactName || '',
      fallbackContactPhone: user.fallbackContactPhone || '',
      fallbackContactEmail: user.fallbackContactEmail || '',
      fallbackContactRelation: user.fallbackContactRelation || '',
      physicalAddress: user.physicalAddress || '',
      requiresAssistedAccess: user.requiresAssistedAccess || false,
      specialInstructions: user.specialInstructions || ''
    });
    this.showCreateForm = true;
  }

  public updateUser(): void {
    if (!this.createUserForm.valid) {
      this.markFormGroupTouched(this.createUserForm);
      return;
    }

    const userData = {
      ...this.editingUser,
      ...this.createUserForm.value
    };

    this.userHttpService.updateLegacyUser(this.editingUser._id, userData).subscribe(
      (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Updated',
          detail: `User ${user.name} updated successfully`
        });
        this.loadLegacyUsers();
        this.cancelCreate();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: error.message || 'Failed to update user'
        });
      }
    );
  }

  public resetPassword(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to reset password for ${user.name}?`,
      header: 'Reset Password',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userHttpService.resetUserPassword(user._id).subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Password Reset',
              detail: `New password: ${response.newPassword}. Please provide this to the user.`
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Reset Failed',
              detail: 'Failed to reset password'
            });
          }
        );
      }
    });
  }

  public sendNotificationToFallback(user: User): void {
    if (!user.fallbackContactEmail && !user.fallbackContactPhone) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Fallback Contact',
        detail: 'User has no fallback contact information'
      });
      return;
    }

    this.userHttpService.sendFallbackNotification(user._id).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Notification Sent',
          detail: `Notification sent to ${user.fallbackContactName}`
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Send Failed',
          detail: 'Failed to send notification'
        });
      }
    );
  }

  public markAsLegacyUser(user: User): void {
    this.confirmationService.confirm({
      message: `Mark ${user.name} as a legacy user?`,
      header: 'Mark as Legacy User',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.userHttpService.markAsLegacyUser(user._id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'User Marked',
              detail: `${user.name} has been marked as a legacy user`
            });
            this.loadLegacyUsers();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Mark Failed',
              detail: 'Failed to mark user as legacy'
            });
          }
        );
      }
    });
  }

  public unmarkLegacyUser(user: User): void {
    this.confirmationService.confirm({
      message: `Remove legacy status from ${user.name}?`,
      header: 'Remove Legacy Status',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.userHttpService.unmarkLegacyUser(user._id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Status Removed',
              detail: `Legacy status removed from ${user.name}`
            });
            this.loadLegacyUsers();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Remove Failed',
              detail: 'Failed to remove legacy status'
            });
          }
        );
      }
    });
  }

  public generateAccessCode(user: User): void {
    this.userHttpService.generateAccessCode(user._id).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Access Code Generated',
          detail: `Access code: ${response.accessCode}. Valid for 24 hours.`
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Generation Failed',
          detail: 'Failed to generate access code'
        });
      }
    );
  }

  public cancelCreate(): void {
    this.showCreateForm = false;
    this.editingUser = null;
    this.createUserForm.reset();
    this.initializeForm();
  }

  public getContactInfo(user: User): string {
    const contacts = [];
    if (user.email) contacts.push(`Email: ${user.email}`);
    if (user.mobile) contacts.push(`Mobile: ${user.mobile}`);
    if (user.fallbackContactName) {
      contacts.push(`Fallback: ${user.fallbackContactName} (${user.fallbackContactRelation || 'Relation not specified'})`);
    }
    return contacts.length > 0 ? contacts.join(', ') : 'No contact information';
  }

  public hasAnyContact(user: User): boolean {
    return !!(user.email || user.mobile || user.fallbackContactEmail || user.fallbackContactPhone);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  public getFieldError(fieldName: string): string {
    const field = this.createUserForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['pattern']) {
        if (fieldName === 'nric') return 'NRIC should be 8-12 alphanumeric characters';
        if (fieldName.includes('Phone') || fieldName === 'mobile') return 'Please enter a valid phone number';
      }
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  public get isCreateMode(): boolean {
    return !this.editingUser;
  }

  public get formTitle(): string {
    return this.isCreateMode ? 'Create Legacy User' : 'Edit Legacy User';
  }

  public get submitButtonLabel(): string {
    return this.isCreateMode ? 'Create User' : 'Update User';
  }
}