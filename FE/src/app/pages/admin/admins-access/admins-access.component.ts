import { Component, OnInit } from '@angular/core';
import { AdminUserModal } from '@app/modals/admin-user/admin-user.modal';
import { CompanyHttpService } from '@app/shared/http-services/company-http.service';
import { User } from '@vpoll-shared/contract';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-admins-access',
  templateUrl: './admins-access.component.html',
  styleUrls: ['./admins-access.component.scss'],
})
export class AdminsAccessComponent implements OnInit {
  public loading = true;
  public users: User[];

  constructor(
    private companyHttpSvc: CompanyHttpService,
    private dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    this.companyHttpSvc.getCompanyAdmins().subscribe((users) => {
      this.users = users;
      this.loading = false;
    });
  }

  public createAdminUser() {
    const dialogRef = this.dialogService.open(AdminUserModal, {
      header: 'Admin Information',
      width: '65%',
    });
    dialogRef.onClose.subscribe((company) => {
      this.ngOnInit();
    });
  }

  public viewAdminUser(user: User) {
    const dialogRef = this.dialogService.open(AdminUserModal, {
      header: 'Admin Information',
      width: '65%',
      data: { user },
    });
    dialogRef.onClose.subscribe((company) => {
      this.ngOnInit();
    });
  }
}
