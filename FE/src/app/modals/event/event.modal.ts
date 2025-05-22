import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { EventHttpService } from '@app/shared/http-services/event-http.service';
import { Event } from '@vpoll-shared/contract';
import { ISODate, ISODateTime } from '@vpoll-shared/type/date.type';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event.modal.html',
  styleUrls: ['./event.modal.scss'],
})
export class EventModal implements OnInit {
  public form: FormGroup;
  public operation: ModalOperationEnum;
  public ModalOperationEnum = ModalOperationEnum;
  public today = new Date();
  public submitted = false;  

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private eventHttpSvc: EventHttpService,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.buildForm();
    this.operation = this.config.data.operation;
    if (
      this.operation === ModalOperationEnum.UPDATE ||
      this.operation === ModalOperationEnum.VIEW
    ) {
      const event: Event = this.config.data.event;

      this.form.patchValue({
        ...event,
        eventDate: new Date(event.startAt),
        startTime: new Date(event.startAt),
        endTime: new Date(event.endAt),
      });
    }
  }

  public buildForm() {
    this.form = this.fb.group({
      _id: [null],
      name: [null, Validators.required],
      description: [null, Validators.required],
      eventDate: [new Date(), Validators.required],
      startTime: [new Date(), Validators.required],
      endTime: [new Date(), Validators.required],
      noticeOfAgmUrl: [null, Validators.required],
      annualReportUrl: [null, Validators.required],
      polling: this.fb.group({
        active: [false],
      }),
      setting: this.fb.group({
        wowzaSdpUrl: [null],
        wowzaApplicationName: [null],
        wowzaStreamName: [null],
        proxyRegstrCutOffTime: [null],
      }),
    });
  }

  public createEvent() {
    this.submitted = true;
    this.eventHttpSvc.createEvent(this.formToEvent()).subscribe((event) => {
      this.messageSvc.add({
        key: 'toast',
        severity: 'success',
        detail: `Evented ${event.name} created successfully.`,
      });
      this.dialogRef.close(event);
    });
  }

  public updateEvent() {
    const event = this.formToEvent();
    this.eventHttpSvc.updateEvent(event._id, event).subscribe((event) => {
      this.messageSvc.add({
        key: 'toast',
        severity: 'success',
        detail: `Event ${event.name} updated successfully.`,
      });
      this.dialogRef.close(event);
    });
  }

  private formToEvent(): Event {
    const result = this.form.value;
    const eventDate = this.browserDateToApiISODateFormat(result.eventDate);

    const startAt = this.setTimeToDate(eventDate, result.startTime);
    const endAt = this.setTimeToDate(eventDate, result.endTime);
    return {
      ...result,
      startAt,
      endAt,
    };
  }

  private browserDateToApiISODateFormat(date?: Date): ISODate {
    const mDate = moment(date);
    return mDate
      .add(mDate.utcOffset(), 'm')
      .utc(false)
      .startOf('day')
      .toISOString();
  }

  private setTimeToDate(date: ISODate, dateTime: Date): ISODateTime {
    const utcDate = (date as string).substring(0, 10);
    const utcTime = moment(dateTime).utc(false).toISOString().substring(11);

    return `${utcDate}T${utcTime}`;
  }
}
