import { Component, OnInit } from '@angular/core';
import { VotingOperation } from '@app/components/resolution-voting/resolution-voting.component';
import { EventContextService } from '@app/services/event-context.service';
import { ShareholderHttpService } from '@app/shared/http-services/shareholder-http.service';
import {
  Event,
  InternalFile,
  ResolutionVotingEntry,
  RichInternalFile,
  Shareholder,
  Voting,
} from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-vote-on-behalf',
  templateUrl: './vote-on-behalf.modal.html',
  styleUrls: ['./vote-on-behalf.modal.scss'],
})
export class VoteOnBehalfModal implements OnInit {
  public loaded = false;
  public shareholder: Shareholder;
  public voting: Voting;
  public event: Event;

  public authorizationLetter: InternalFile;
  public VotingOperation = VotingOperation;

  constructor(
    private config: DynamicDialogConfig,
    private eventContext: EventContextService,
    private shareholderHttpSvc: ShareholderHttpService,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.shareholder = this.config.data.shareholder;
    this.event = this.eventContext.event;
    this.shareholderHttpSvc
      .getShareholderVoting(this.eventContext.eventId, this.shareholder._id)
      .subscribe((voting) => {
        this.voting = voting;
        this.authorizationLetter = voting
          ? this.voting.voteOnBehalfLetter
          : null;
        this.loaded = true;
      });
  }

  public addAuthorizationForm(file: RichInternalFile) {
    this.authorizationLetter = file;
  }

  public onVote(result: ResolutionVotingEntry[]) {
    this.shareholderHttpSvc
      .addShareholderVoting(
        this.eventContext.eventId,
        this.shareholder._id,
        result,
        this.authorizationLetter._id
      )
      .subscribe((voting) => {
        this.voting = voting;
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: `You have successfully casted votes on all the resolutions on behalf of ${this.shareholder.name}`,
          detail: 'Success',
        });
      });
  }
}
