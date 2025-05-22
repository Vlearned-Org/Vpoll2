import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { ReportHttpService } from '@app/shared/http-services/report-http.service';
import { Event } from '@vpoll-shared/contract';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-event-reports',
  templateUrl: './event-reports.component.html',
  styleUrls: ['./event-reports.component.scss'],
})
export class EventReportsComponent implements OnInit {
  public event: Event;

  constructor(
    private reportHttpSvc: ReportHttpService,
    private eventContextSvc: EventContextService
  ) {}

  public ngOnInit(): void {
    this.event = this.eventContextSvc.event;
    console.log(this.event.polling.status);
  }
  

  public generateQuestionReport() {
    this.reportHttpSvc
      .generateQuestionReport(this.event._id)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `question-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public generateAttendanceReport() {
    this.reportHttpSvc
      .generateAttendanceReport(this.event._id)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `attendance-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public generateQuorumReport() {
    this.reportHttpSvc
      .generateQuorumReport(this.event._id)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `quorum-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public generateProxyVotingReport() {
    this.reportHttpSvc
      .generateProxyVotingReport(this.event._id)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `proxy-voting-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public generateProxyConsolidatedReport() {
    this.reportHttpSvc
      .generateProxyConsolidatedReport(this.event._id)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `proxy-consolidated-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public generateFinalResult() {
    this.reportHttpSvc
      .generateFinalPollingResult(this.event._id)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `final-polling-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public isResultPublished(): boolean {
    return this.event.polling.status === "publish";
  }

  public isnotResultPublished(): boolean {
    return this.event.polling.status !== "publish";
  }
}
