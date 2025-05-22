import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { CorporateHttpService } from '@app/shared/http-services/corporate-http.service';
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
  selector: 'app-corporate-voting',
  templateUrl: './corporate-voting.component.html',
  styleUrls: ['./corporate-voting.component.scss'],
})
export class CorporateVotingComponent implements OnInit {
  public resolutions: Resolution[];

  public votings: Voting[];
  public votingLoading = true;

  public votingResult: ResolutionVotingResult[];
  public votingResultLoading = true;

  constructor(
    public eventContextSvc: EventContextService,
    private corporateHttpSvc: CorporateHttpService,
    private eventContext: EventContextService,
    private reportHttpSvc: ReportHttpService
  ) {}

  ngOnInit(): void {
    const eventId = this.eventContext.eventId;
    this.resolutions = this.eventContext.event.resolutions;
    this.corporateHttpSvc.listCorporatesVoting(eventId).subscribe((votings) => {
      this.votings = votings;
      this.votingLoading = false;
    });
    this.corporateHttpSvc
      .generateVotingResult(eventId)
      .subscribe((votingResult) => {
        this.votingResult = votingResult;
        this.votingResultLoading = false;
      });
  }

  public generateCorporateConsolidatedReport() {
    this.reportHttpSvc
      .generateCorporateConsolidatedReport(this.eventContext.eventId)
      .subscribe((report) => {
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `consolidated-corporate-report.xlsx`;
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
