import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { CompanyHttpService } from '@app/shared/http-services/company-http.service';
import { User } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.modal.html',
  styleUrls: ['./admin-user.modal.scss'],
})
export class AdminUserModal implements OnInit {
  public operation: ModalOperationEnum;
  public form: FormGroup;
  public ModalOperationEnum = ModalOperationEnum;
  private user: User = null;

  constructor(
    private companyHttpSvc: CompanyHttpService,
    private fb: FormBuilder,
    private config: DynamicDialogConfig,
    private messageSvc: MessageService,
    private dialogRef: DynamicDialogRef
  ) {}

  public ngOnInit(): void {
    this.user = this.config.data?.user;

    this.form = this.fb.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
    });
    if (this.user) {
      this.operation = ModalOperationEnum.UPDATE;
      this.form.patchValue(this.user);
    } else {
      this.operation = ModalOperationEnum.CREATE;
    }
  }

  public create() {
    this.companyHttpSvc
      .createCompanyAdmin(this.form.value)
      .subscribe((result) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Admin created successfully',
        });
        this.dialogRef.close();
      });
  }
}
