import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LegacyUserRequestHttpService, LegacyUserRequest, RequestStats, ApproveRequestDto, RejectRequestDto, ApproveRequestResponse } from '@app/shared/http-services/legacy-user-request-http.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-legacy-user-requests',
  templateUrl: './legacy-user-requests.component.html',
  styleUrls: ['./legacy-user-requests.component.scss'],
})
export class LegacyUserRequestsComponent implements OnInit {
  public requests: LegacyUserRequest[] = [];
  public filteredRequests: LegacyUserRequest[] = [];
  public loading = true;
  public stats: RequestStats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processed: 0
  };

  public selectedRequest: LegacyUserRequest = null;
  public showRequestDetail = false;
  public showApprovalDialog = false;
  public showRejectionDialog = false;
  public showCredentialsDialog = false;
  public generatedCredentials: {
    email: string;
    password: string;
    userId: string;
  } = null;

  public approvalForm: FormGroup;
  public rejectionForm: FormGroup;
  public notesForm: FormGroup;

  public statusFilter = 'all';
  public statusOptions = [
    { label: 'All Requests', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Processed', value: 'processed' }
  ];

  public requestTypeLabels = {
    new_account: 'New Account',
    password_reset: 'Password Reset'
  };

  public contactMethodLabels = {
    email: 'Email',
    in_person: 'In-Person Visit'
  };

  constructor(
    private legacyRequestService: LegacyUserRequestHttpService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadRequests();
    this.loadStats();
  }

  private initializeForms(): void {
    this.approvalForm = this.fb.group({
      adminNotes: [''],
      createUser: [true],
      generatePassword: [true],
      customPassword: [''],
      email: [''],
      mobile: ['']
    });

    this.rejectionForm = this.fb.group({
      rejectionReason: ['', [Validators.required, Validators.minLength(10)]],
      adminNotes: ['']
    });

    this.notesForm = this.fb.group({
      adminNotes: ['']
    });

    this.approvalForm.get('generatePassword').valueChanges.subscribe(generate => {
      const passwordControl = this.approvalForm.get('customPassword');
      if (generate) {
        passwordControl.clearValidators();
      } else {
        passwordControl.setValidators([Validators.required, Validators.minLength(8)]);
      }
      passwordControl.updateValueAndValidity();
    });
  }

  public loadRequests(): void {
    this.loading = true;
    this.legacyRequestService.getAllRequests().subscribe(
      (requests) => {
        this.requests = requests;
        this.applyStatusFilter();
        this.loading = false;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Failed to load legacy user requests'
        });
        this.loading = false;
      }
    );
  }

  public loadStats(): void {
    this.legacyRequestService.getRequestStats().subscribe(
      (stats) => {
        this.stats = stats;
      },
      (error) => {
        console.error('Failed to load stats:', error);
      }
    );
  }

  public onStatusFilterChange(): void {
    this.applyStatusFilter();
  }

  private applyStatusFilter(): void {
    if (this.statusFilter === 'all') {
      this.filteredRequests = [...this.requests];
    } else {
      this.filteredRequests = this.requests.filter(req => req.status === this.statusFilter);
    }
  }

  public viewRequestDetail(request: LegacyUserRequest): void {
    this.selectedRequest = request;
    this.notesForm.patchValue({
      adminNotes: request.adminNotes || ''
    });
    this.showRequestDetail = true;
  }

  public closeRequestDetail(): void {
    this.showRequestDetail = false;
    this.selectedRequest = null;
  }

  public openApprovalDialog(request: LegacyUserRequest): void {
    this.selectedRequest = request;
    this.approvalForm.patchValue({
      adminNotes: '',
      createUser: true,
      generatePassword: true,
      customPassword: '',
      email: request.contactPersonEmail || '',
      mobile: ''
    });
    this.showApprovalDialog = true;
  }

  public openRejectionDialog(request: LegacyUserRequest): void {
    this.selectedRequest = request;
    this.rejectionForm.reset();
    this.showRejectionDialog = true;
  }

  public approveRequest(): void {
    if (!this.approvalForm.valid) {
      this.markFormGroupTouched(this.approvalForm);
      return;
    }

    const formValue = this.approvalForm.value;
    const approveData: ApproveRequestDto = {
      adminNotes: formValue.adminNotes,
      createUser: formValue.createUser
    };

    if (formValue.createUser) {
      approveData.userData = {
        email: formValue.email,
        mobile: formValue.mobile
      };

      if (!formValue.generatePassword && formValue.customPassword) {
        approveData.userData.password = formValue.customPassword;
      }
    }

    this.legacyRequestService.approveRequest(this.selectedRequest._id, approveData).subscribe(
      (response: ApproveRequestResponse) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Request Approved',
          detail: `Request from ${this.selectedRequest.name} has been approved${formValue.createUser ? ' and user account created' : ''}`
        });
        this.showApprovalDialog = false;
        
        // If user was created and password was generated, show credentials
        if (response.userCreated && response.generatedPassword) {
          this.generatedCredentials = {
            email: formValue.email || this.selectedRequest.contactPersonEmail || this.selectedRequest.nric,
            password: response.generatedPassword,
            userId: response.userId
          };
          this.showCredentialsDialog = true;
        }
        
        this.loadRequests();
        this.loadStats();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: error.message || 'Failed to approve request'
        });
      }
    );
  }

  public rejectRequest(): void {
    if (!this.rejectionForm.valid) {
      this.markFormGroupTouched(this.rejectionForm);
      return;
    }

    const rejectData: RejectRequestDto = this.rejectionForm.value;

    this.legacyRequestService.rejectRequest(this.selectedRequest._id, rejectData).subscribe(
      (updatedRequest) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Request Rejected',
          detail: `Request from ${this.selectedRequest.name} has been rejected`
        });
        this.showRejectionDialog = false;
        this.loadRequests();
        this.loadStats();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejection Failed',
          detail: error.message || 'Failed to reject request'
        });
      }
    );
  }

  public updateAdminNotes(): void {
    const adminNotes = this.notesForm.get('adminNotes').value;
    
    this.legacyRequestService.updateAdminNotes(this.selectedRequest._id, adminNotes).subscribe(
      (updatedRequest) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Notes Updated',
          detail: 'Admin notes have been updated'
        });
        this.selectedRequest.adminNotes = adminNotes;
        // Update the request in the list
        const index = this.requests.findIndex(r => r._id === this.selectedRequest._id);
        if (index !== -1) {
          this.requests[index].adminNotes = adminNotes;
        }
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Failed to update admin notes'
        });
      }
    );
  }

  public deleteRequest(request: LegacyUserRequest): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the request from ${request.name}? This action cannot be undone.`,
      header: 'Delete Request',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.legacyRequestService.deleteRequest(request._id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Request Deleted',
              detail: 'Request has been deleted successfully'
            });
            this.loadRequests();
            this.loadStats();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Failed to delete request'
            });
          }
        );
      }
    });
  }

  public getStatusSeverity(status: string): string {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'processed': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  }

  public getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'pi pi-clock';
      case 'approved': return 'pi pi-check';
      case 'processed': return 'pi pi-check-circle';
      case 'rejected': return 'pi pi-times';
      default: return 'pi pi-question';
    }
  }

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }

  public getFieldError(fieldName: string, formGroup: FormGroup = this.rejectionForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['email']) return 'Please enter a valid email';
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  public get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  public get hasContactInfo(): boolean {
    if (!this.selectedRequest) return false;
    return !!(this.selectedRequest.contactPersonEmail);
  }

  public navigateToLegacyUsers(): void {
    this.router.navigate(['/admin/legacy-users']);
  }

  public closeCredentialsDialog(): void {
    this.showCredentialsDialog = false;
    this.generatedCredentials = null;
  }

  public copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'warn',
        summary: 'Copy Failed',
        detail: 'Failed to copy to clipboard'
      });
    });
  }

  public printCredentials(): void {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>User Credentials - ${this.selectedRequest?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .credentials { border: 2px solid #ccc; padding: 20px; margin: 20px 0; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; }
            .value { font-family: monospace; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>User Account Credentials</h2>
            <p>For: ${this.selectedRequest?.name} (${this.selectedRequest?.nric})</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <div class="credentials">
            <div class="field">
              <div class="label">Username:</div>
              <div class="value">${this.generatedCredentials?.email}</div>
            </div>
            <div class="field">
              <div class="label">Password:</div>
              <div class="value">${this.generatedCredentials?.password}</div>
            </div>
            <div class="field">
              <div class="label">User ID:</div>
              <div class="value">${this.generatedCredentials?.userId}</div>
            </div>
          </div>
          <p><strong>Note:</strong> Please provide these credentials to the user securely. The password should be changed on first login.</p>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
}