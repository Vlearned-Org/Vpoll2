import { Component, OnInit } from '@angular/core';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { Event, ResolutionVotingResult } from '@vpoll-shared/contract';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  templateUrl: './view-publish-result.modal.html',
  styleUrls: ['./view-publish-result.modal.scss'],
})
export class ViewPublishResultModal implements OnInit {
  public event: Event;
  public votingResult: ResolutionVotingResult[];

  constructor(
    private meHttpSvc: MeHttpService,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.event = this.config.data.event;
    this.meHttpSvc.getEventVotingResult(this.event._id).subscribe((result) => {
      this.votingResult = result;
    });
  }
}
