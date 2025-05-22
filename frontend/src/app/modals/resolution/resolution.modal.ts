import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { ResolutionHttpService } from '@app/shared/http-services/resolution-http.service';
import { Event, Resolution, Shareholder } from '@vpoll-shared/contract';
import { ResolutionTypeEnum } from '@vpoll-shared/enum';
import { MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-resolution-modal',
  templateUrl: './resolution.modal.html',
  styleUrls: ['./resolution.modal.scss'],
})
export class ResolutionModal implements OnInit {
  public form: FormGroup;
  public operation: ModalOperationEnum;

  public ModalOperationEnum = ModalOperationEnum;

  public event: Event;
  public resolution?: Resolution;
  public shareholders: Shareholder[];
  public shareholderList: SelectItem[];
  public resolutionTypeOptions: SelectItem[] = [
    {
      label: 'Ordinary',
      value: ResolutionTypeEnum.ORDINARY,
    },
    {
      label: 'Special',
      value: ResolutionTypeEnum.SPECIAL,
    },
    {
      label: 'Two Tiers',
      value: ResolutionTypeEnum.TWO_TIER,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageSvc: MessageService,
    private resolutionHttpSvc: ResolutionHttpService
  ) {}

  public ngOnInit(): void {
    this.buildForm();
    this.operation = this.config.data.operation;

    this.event = this.config.data.event;
    this.shareholders = this.config.data.shareholders;

    this.shareholderList = this.shareholders.map((shareholder) => {
      return {
        label: `${shareholder.name} ${shareholder.cds}`,
        value: shareholder.cds,
      };
    });

    if (this.operation === ModalOperationEnum.UPDATE) {
      this.resolution = this.config.data.resolution;
      this.form.patchValue(this.resolution);
    }
  }

  public buildForm() {
    this.form = this.fb.group({
      index: [null, [Validators.required, Validators.min(1)]],
      type: [ResolutionTypeEnum.ORDINARY, Validators.required],
      title: [null, Validators.required],
      abstainCDS: [[]],
    });
  }

  public createResolution() {
    if (this.form.valid) {
      const resolution = this.form.value as Resolution;
      this.resolutionHttpSvc
        .createResolution(this.event._id, resolution)
        .subscribe((event) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            detail: `Resolution ${resolution.index + 1} created successfully.`,
          });
          this.dialogRef.close(event);
        });
    }
  }

  public updateResolution() {
    if (this.form.valid) {
      const resolution = this.form.value as Resolution;
      this.resolutionHttpSvc
        .updateResolution(this.event._id, this.resolution._id, resolution)
        .subscribe((event) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            detail: `Resolution ${resolution.index + 1} updated successfully.`,
          });
          this.dialogRef.close(event);
        });
    }
  }

  public abstainCDS() {
    return this.form.get('abstainCDS').value;
  }
}
