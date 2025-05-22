import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { CorporateHttpService } from '@app/shared/http-services/corporate-http.service';

import { CountryMobileCodes } from '@app/shared/mobile-country-code';
import { Event, Corporate } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-corporate',
  templateUrl: './corporate.modal.html',
  styleUrls: ['./corporate.modal.scss'],
})
export class CorporateModal implements OnInit {
  public corporateForm: FormGroup;
  public countryMobileCode = CountryMobileCodes;
  public selectedCountryMobileCode = this.countryMobileCode[0];

  public event: Event;
  public operation: ModalOperationEnum;
  public ModalOperationEnum = ModalOperationEnum;

  constructor(
    private fb: FormBuilder,
    private config: DynamicDialogConfig,
    private corporateHttpSvc: CorporateHttpService,
    private dialogRef: DynamicDialogRef,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.event = this.config.data.event;
    this.operation = this.config.data.operation;
    this.buildForm();
    if (this.operation === ModalOperationEnum.UPDATE) {
      const corporate: Corporate = this.config.data.corporate;
      this.selectedCountryMobileCode = this.countryMobileCode.find(
        (mc) => mc.name === `+${corporate.mobile.substring(0, 2)}`
      );

      this.corporateForm.patchValue({
        _id: corporate._id,
        name: corporate.name,
        email: corporate.email,
        company: corporate.company,
        mobile: corporate.mobile.substring(2),
      });
    }
  }

  public buildForm() {
    this.corporateForm = this.fb.group({
      _id: [null],
      name: [null, Validators.required],
      mobile: [null, Validators.required],
      email: [null, Validators.required],
      company: [null, Validators.required],
    });
  }

  public createCorporate() {
    if (this.corporateForm.valid) {
      const { _id, name, email,company, mobile } = this.corporateForm.value;
      this.corporateHttpSvc
        .addCorporate(this.event._id, { name, email,company,mobile: this.mobile })
        .subscribe((corporate) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            summary: 'Corporate created',
            detail: 'Success',
          });

          this.dialogRef.close(corporate);
        });
    }
  }

  public updateCorporate() {
    if (this.corporateForm.valid) {
      const { _id, name,email,company } = this.corporateForm.value;
      this.corporateHttpSvc
        .updateCorporate(this.event._id, _id, { name,email,company, mobile: this.mobile })
        .subscribe((corporate) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            summary: 'Corporate updated',
            detail: 'Success',
          });
          this.dialogRef.close(corporate);
        });
    }
  }

  public get mobile() {
    return `${this.selectedCountryMobileCode.name}${this.corporateForm.value.mobile}`.replace(
      /\D/g,
      ''
    );
  }
}
