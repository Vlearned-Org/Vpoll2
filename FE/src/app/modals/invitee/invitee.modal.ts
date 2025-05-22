import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { InviteeHttpService } from '@app/shared/http-services/invitee-http.service';
import { CountryMobileCodes } from '@app/shared/mobile-country-code';
import { Event, Invitee } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-invitee',
  templateUrl: './invitee.modal.html',
  styleUrls: ['./invitee.modal.scss'],
})
export class InviteeModal implements OnInit {
  public inviteeForm: FormGroup;
  public countryMobileCode = CountryMobileCodes;
  public selectedCountryMobileCode = this.countryMobileCode[0];

  public event: Event;
  public operation: ModalOperationEnum;
  public ModalOperationEnum = ModalOperationEnum;

  constructor(
    private fb: FormBuilder,
    private config: DynamicDialogConfig,
    private inviteeHttpSvc: InviteeHttpService,
    private dialogRef: DynamicDialogRef,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.event = this.config.data.event;
    this.operation = this.config.data.operation;
    this.buildForm();
    if (this.operation === ModalOperationEnum.UPDATE) {
      const invitee: Invitee = this.config.data.invitee;
      this.selectedCountryMobileCode = this.countryMobileCode.find(
        (mc) => mc.name === `+${invitee.mobile.substring(0, 2)}`
      );

      this.inviteeForm.patchValue({
        _id: invitee._id,
        name: invitee.name,
        email: invitee.email,
        mobile: invitee.mobile.substring(2),
      });
    }
  }

  public buildForm() {
    this.inviteeForm = this.fb.group({
      _id: [null],
      name: [null, Validators.required],
      email: [null, Validators.required],
      mobile: [null, Validators.required],
      
    });
  }

  public createInvitee() {
    if (this.inviteeForm.valid) {
      const { _id, name, email, mobile } = this.inviteeForm.value;
      this.inviteeHttpSvc
        .addInvitee(this.event._id, { name, email,mobile: this.mobile })
        .subscribe((invitee) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            summary: 'Invitee created',
            detail: 'Success',
          });

          this.dialogRef.close(invitee);
        });
    }
  }

  public updateInvitee() {
    if (this.inviteeForm.valid) {
      const { _id, name,email } = this.inviteeForm.value;
      console.log(email);
      this.inviteeHttpSvc
        .updateInvitee(this.event._id, _id, { name,email, mobile: this.mobile })
        .subscribe((invitee) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            summary: 'Invitee updated',
            detail: 'Success',
          });
          this.dialogRef.close(invitee);
        });
    }
  }

  public get mobile() {
    return `${this.selectedCountryMobileCode.name}${this.inviteeForm.value.mobile}`.replace(
      /\D/g,
      ''
    );
  }
}
