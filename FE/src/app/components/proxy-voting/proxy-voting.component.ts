import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { ProxyHttpService } from '@app/shared/http-services/proxy-http.service';
import { ReportHttpService } from '@app/shared/http-services/report-http.service';
import {
  Resolution,
  ResolutionVotingEntry,
  ResolutionVotingResult,
  Voting,
} from '@vpoll-shared/contract';
import { VotingResponseEnum } from '@vpoll-shared/enum';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-proxy-voting',
  templateUrl: './proxy-voting.component.html',
  styleUrls: ['./proxy-voting.component.scss'],
})
export class ProxyVotingComponent implements OnInit {
  public resolutions: Resolution[];

  public votings: Voting[];
  public votingLoading = true;

  public votingResult: ResolutionVotingResult[];
  public votingResultLoading = true;

  constructor(
    public eventContextSvc: EventContextService,
    private proxyHttpSvc: ProxyHttpService,
    private eventContext: EventContextService,
    private reportHttpSvc: ReportHttpService
  ) {}

  ngOnInit(): void {
    const eventId = this.eventContext.eventId;
    this.resolutions = this.eventContext.event.resolutions;
    this.proxyHttpSvc.listProxiesVoting(eventId).subscribe((votings) => {
      this.votings = votings;
      this.votingLoading = false;
    });
    this.proxyHttpSvc
      .generateVotingResult(eventId)
      .subscribe((votingResult) => {
        this.votingResult = votingResult;
        this.votingResult.sort((a, b) => a.index - b.index);
        this.votingResultLoading = false;
      });
  }

  public generateProxyConsolidatedReport() {
    this.reportHttpSvc
      .generateProxyConsolidatedReport(this.eventContext.eventId)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `consolidated-proxy-report.xlsx`;
        saveAs(blob, fileName);
      });
  }

  public getResolutionVoting(
    target: Resolution,
    votingResults: Array<ResolutionVotingEntry>
  ): VotingResponseEnum {
    const votingResult = votingResults.find(
      (vR) => vR.resolutionId === target._id
    );
    return votingResult ? votingResult.response : null;
  }
}
