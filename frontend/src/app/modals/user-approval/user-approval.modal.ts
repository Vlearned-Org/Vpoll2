import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '@app/shared/http-services/user-http.service';
import { User } from '@vpoll-shared/contract';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-user-approval-modal',
  templateUrl: './user-approval.modal.html',
  styleUrls: ['./user-approval.modal.scss'],
})
export class UserApprovalModal implements OnInit {
  public user: User;
  public rejectDialogDisplay = false;
  public reason: string;
  

  constructor(
    private config: DynamicDialogConfig,
    private userHttp: UserHttpService,
    private dialogRef: DynamicDialogRef,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.user = this.config.data.user;
  }

  public approve() {
    console.log('Starting approval process for user:', this.user._id);
    console.log('Current token:', localStorage.getItem('access_token'));
    
    this.userHttp.approveUser(this.user._id).subscribe(
      (user) => {
        console.log('Approval successful:', user);
        
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          detail: `Successfully approved the user`,
        });
        
        this.dialogRef.close();
      },
      (error) => {
        console.error('Approval failed:', error);
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          detail: `Failed to approve user: ${error.message || 'Unknown error'}`,
        });
      }
    );
  }

  public reject() {
    this.userHttp.rejectUser(this.user._id, this.reason).subscribe(
      (user) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          detail: `Successfully rejected the user`,
        });
        this.dialogRef.close();
      },
      (error) => {
        console.error('Rejection failed:', error);
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          detail: `Failed to reject user: ${error.message || 'Unknown error'}`,
        });
      }
    );
  }

  public cancelReject() {
    this.rejectDialogDisplay = false;
    this.reason = null;
  }
}

