import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import {
  ShareholderAdd,
  ShareholderUpdate,
} from '@app/store/actions/shareholder.action';
import { Store } from '@ngxs/store';
import { Shareholder } from '@vpoll-shared/contract';
import { ShareholderTypeEnum } from '@vpoll-shared/enum';
import { SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-shareholder-modal',
  templateUrl: './shareholder.modal.html',
  styleUrls: ['./shareholder.modal.scss'],
})
export class ShareholderModal implements OnInit {
  public form: FormGroup;
  public operation: ModalOperationEnum;
  public shareholder: Shareholder;
  public cdsList = [];

  public ModalOperationEnum = ModalOperationEnum;
  public shareholderTypeOptions: SelectItem[] = [
    {
      label: 'Shareholder',
      value: ShareholderTypeEnum.SHAREHOLDER,
    },
    {
      label: 'Director',
      value: ShareholderTypeEnum.DIRECTOR,
    },
    {
      label: 'Chairman',
      value: ShareholderTypeEnum.CHAIRMAN,
    },
  ];
  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private store: Store,
    private eventContext: EventContextService,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.buildForm();
    this.operation = this.config.data.operation;
    this.cdsList = this.config.data.existingcds;
    if (this.operation === ModalOperationEnum.CREATE) {
      this.form.patchValue({
        companyId: this.eventContext.event.companyId,
        eventId: this.eventContext.eventId,
      });
    }
    if (this.operation === ModalOperationEnum.UPDATE) {
      this.shareholder = this.config.data.shareholder;
      this.form.patchValue(this.shareholder);
    }
  }

  public buildForm() {
    const property: Record<keyof Shareholder, any> = {
      _id: [null],
      companyId: [null, Validators.required],
      eventId: [null, Validators.required],
      userId: [null],
      name: [null, Validators.required],
      identityNumber: [null, Validators.required],
      cds: [null, Validators.required],
      numberOfShares: [0, Validators.required],
      isLargeShareholder: [false, Validators.required],
      shareholderType: [ShareholderTypeEnum.SHAREHOLDER, Validators.required],
      nationality: [],
      oldIC: [],
      pc: [],
      pbc: [],
    };
    this.form = this.fb.group(property);
  }

  public createShareholder() {

  if (!this.cdsList.includes(this.form.value.cds)){ 
    if (this.form.valid) {
      this.store
        .dispatch(
          new ShareholderAdd(
            this.eventContext.eventId as string,
            this.form.value
          )
        )
        .subscribe(() => {
          this.dialogRef.close();
        });
    }
  }

  else { 

    this.messageSvc.add({
      key: 'toast',
      severity: 'error',
      detail: "The CDS is already existed",
    });
  }
}


  public updateShareholder() {
    if (this.form.valid) {
      this.store
        .dispatch(
          new ShareholderUpdate(
            this.shareholder.eventId as string,
            this.shareholder._id,
            this.form.value
          )
        )
        .subscribe(() => {
          this.dialogRef.close();
        });
    }
  }
}
