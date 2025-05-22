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
    this.messageSvc.add({
      key: 'toast',
      severity: 'success',
      detail: `Successfully approved the user`,
    });
    this.userHttp.approveUser(this.user._id).subscribe((user) => {
      this.dialogRef.close();
    });



  }

  public reject() {
    this.messageSvc.add({
      key: 'toast',
      severity: 'success',
      detail: `Successfully rejected the user`,
    });
    this.userHttp.rejectUser(this.user._id, this.reason).subscribe((user) => {
      this.dialogRef.close();
    });
  }

  public cancelReject() {
    this.rejectDialogDisplay = false;
    this.reason = null;
  }
}
