import { Component, OnInit } from '@angular/core';
import { VotingOperation } from '@app/components/resolution-voting/resolution-voting.component';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import {
  Event,
  Proxy,
  ResolutionVotingEntry,
  Shareholder,
  Corporate,
  Voting,
} from '@vpoll-shared/contract';
import { VotingResponseEnum } from '@vpoll-shared/enum';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  templateUrl: './user-voting.modal.html',
  styleUrls: ['./user-voting.modal.scss'],
})
export class UserVotingModal implements OnInit {
  public loaded = false;
  public VotingOperation = VotingOperation;
  public event: Event;
  public shareholder: Shareholder & { remainderShares: number };
  public proxy: Proxy;
  public corporate: Corporate;
  public voting: Voting;

  public operation: VotingOperation;

  public VotingResponseEnum = VotingResponseEnum;

  constructor(
    private meHttpSvc: MeHttpService,
    private config: DynamicDialogConfig,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    const eventId = this.config.data.event._id;
    this.operation = this.config.data.operation;
    this.shareholder = this.config.data.shareholder;
    this.proxy = this.config.data.proxy;
    this.corporate = this.config.data.corporate;

    this.meHttpSvc.leanEventById(eventId).subscribe((event) => {
      this.event = event;
      if (this.shareholder) {
        this.meHttpSvc
          .getVoting(eventId, 'SHAREHOLDER', this.shareholder._id)
          .subscribe((voting) => {
            this.voting = voting;
            this.loaded = true;
          });
      } else if (this.proxy) {
        this.meHttpSvc
          .getVoting(eventId, 'PROXY', this.proxy._id)
          .subscribe((voting) => {
            this.voting = voting;
            this.loaded = true;
          });
      } 

      
      else {
        this.loaded = true;
      }
    });
  }

  public onShareholderVote(result: ResolutionVotingEntry[]) {
    
    this.meHttpSvc
      .voteAsShareholder(this.event._id, this.shareholder._id, result)
      .subscribe((voting) => {
        this.voting = voting;
        this.config.data.closeDialog();
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: `You have successfully casted votes on all the resolutions`,
          detail: 'Success',
        });
      });
  }

  public onProxyVote(result: ResolutionVotingEntry[]) {
    this.meHttpSvc
      .voteAsProxy(this.event._id, this.proxy._id, result)
      .subscribe((voting) => {
        this.voting = voting;
        this.config.data.closeDialog();
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: `You have successfully casted votes on all the resolutions`,
          detail: 'Success',
        });
      });
  }



  public onShareholderVoteForAssignedProxy(result: ResolutionVotingEntry[]) {}
}
