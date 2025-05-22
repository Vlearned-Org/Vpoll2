import { Component, OnInit } from '@angular/core';
import { UserApprovalModal } from '@app/modals/user-approval/user-approval.modal';
import { UserHttpService } from '@app/shared/http-services/user-http.service';
import { User } from '@vpoll-shared/contract';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  public loading = true;
  public users: User[];

  constructor(
    private userHttpSvc: UserHttpService,
    private dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    this.userHttpSvc.listUsers().subscribe((users) => {
      this.users = users;
      this.loading = false;
    });
  }

  public viewUser(user: User) {
    const dialogRef = this.dialogService.open(UserApprovalModal, {
      header: 'User Information',
      width: '65%',
      data: { user ,closeDialog: () => dialogRef.close()},
    });
    dialogRef.onClose.subscribe((company) => {
      this.ngOnInit();
    });
  }
}
