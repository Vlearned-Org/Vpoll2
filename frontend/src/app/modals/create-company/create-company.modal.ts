import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemCompanyHttpService } from '@app/shared/http-services/system-company-http.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.modal.html',
  styleUrls: ['./create-company.modal.scss'],
})
export class CreateCompanyModal implements OnInit {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageSvc: MessageService,
    private dialogRef: DynamicDialogRef,
    private companyHttpSvc: SystemCompanyHttpService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
    });
  }

  public createCompany() {
    this.companyHttpSvc.createCompany(this.form.value).subscribe((company) => {
      console.log(this.form.value);
      this.messageSvc.add({
        key: 'toast',
        severity: 'success',
        summary: `Company ${company.name} created successfully.`,
        detail: 'Success',
      });
      this.dialogRef.close();
    });
  }
}
