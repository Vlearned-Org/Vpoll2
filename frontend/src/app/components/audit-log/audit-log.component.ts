import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { EventHttpService } from '@app/shared/http-services/event-http.service';
import {
  AuditContract,
  AuditTypes,
  Event,
  Resolution,
} from '@vpoll-shared/contract';
import { AuditTypeEnum } from '@vpoll-shared/enum';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
})
export class AuditLogComponent implements OnInit {
  public event: Event;
  public selectedType: AuditTypeEnum;
  public types: SelectItem[] = [
    { label: 'Event', value: AuditTypeEnum.EVENT },
    { label: 'User', value: AuditTypeEnum.USER },
    { label: 'Attendance', value: AuditTypeEnum.ATTENDANCE },
    { label: 'Question', value: AuditTypeEnum.QUESTION },
    { label: 'Vote', value: AuditTypeEnum.VOTE },
  ];
  public auditLogs: AuditContract<AuditTypes>[];
  public resolutions: Resolution[];

  constructor(
    public eventContext: EventContextService,
    private eventHttpSvc: EventHttpService
  ) {}

  ngOnInit(): void {
    this.event = this.eventContext.event;
    this.resolutions = this.event.resolutions;
    this.eventHttpSvc
      .getEventAuditLogs(this.event._id)
      .subscribe((auditLogs) => {
        this.auditLogs = auditLogs;
      });
  }
}
