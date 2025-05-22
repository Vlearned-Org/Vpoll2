import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Event,
  InternalFile,
  PollingStatusEnum,
  Proxy,
  ResolutionVotingEntry,
  Shareholder,
  Voting
} from '@vpoll-shared/contract';
import { VotingResponseEnum } from '@vpoll-shared/enum';
import { MessageService } from 'primeng/api';
export enum VotingOperation {
  SHAREHOLDER_VOTE = 'shareholder-vote',
  PROXY_VOTE = 'proxy-vote',

  CHAIRMAN_VOTE_AS_PROXY = 'chairman-vote-as-proxy',

  CHAIRMAN_VOTE_AS_SECOND_PROXY = 'chairman-vote-as-second-proxy',

  CHAIRMAN_VOTE_ON_BEHALF = 'chairman-vote-on-behalf',
  SHAREHOLDER_REVOTE_FOR_OWN_PROXY = 'shareholder-revote-for-own-proxy',

}

@Component({
  selector: 'app-resolution-voting',
  templateUrl: './resolution-voting.component.html',
  styleUrls: ['./resolution-voting.component.scss'],
})
export class ResolutionVotingComponent implements OnInit {
  @Input() operation: VotingOperation;
  @Input() event: Event;
  @Input() canVote: boolean;
  @Input() proxy?: Proxy;

  @Input() shareholder?: Shareholder & { remainderShares: number };
  @Input() voting?: Voting;
  @Input() file?: InternalFile;
  @Output() onVoteEvent: EventEmitter<ResolutionVotingEntry[]> =
    new EventEmitter<ResolutionVotingEntry[]>();

  public votingForm: FormGroup;
  public VotingResponseEnum = VotingResponseEnum;
  public PollingStatusEnum = PollingStatusEnum;
  public VotingOperation = VotingOperation;

  public filteredevent : Event;

  // Context

  constructor(private fb: FormBuilder,private messageSvc: MessageService,) {
    
  }

  public ngOnInit(): void {
    var cdsvalue = ""
    if (this.shareholder){
       cdsvalue =this.shareholder.cds;
    }

    if (this.proxy){

      if (typeof this.proxy.shareholderId === 'object' && this.proxy.shareholderId !== null) {
        cdsvalue = this.proxy.shareholderId.cds;
      }
    }    
    this.filteredevent = { ...this.event }; 
    this.filteredevent.resolutions = this.event.resolutions.filter(resolution => {
      return !( resolution.abstainCDS.includes(cdsvalue));
    });    
    this.buildVotingForm();

    // Update
    if (this.voting) {
      this.votingForm.patchValue(this.voting);
    } else {
      switch (this.operation) {
        case VotingOperation.PROXY_VOTE:
        case VotingOperation.SHAREHOLDER_REVOTE_FOR_OWN_PROXY:
        case VotingOperation.CHAIRMAN_VOTE_AS_PROXY:
          this.updateVotingShares(this.proxy.allocatedShares);
          break;
        case VotingOperation.SHAREHOLDER_VOTE:
        case VotingOperation.CHAIRMAN_VOTE_ON_BEHALF:
            // Should i deduct the share?
            this.updateVotingShares(this.shareholder.numberOfShares);
            break;
    
      }
    }
      // Mark controls as touched to trigger validation messages
  this.votingForm.markAllAsTouched();

  console.log('ngOnInit completed');
  console.log('Event:', this.event);
  console.log('Proxy:', this.proxy);
  console.log('Shareholder:', this.shareholder);
  }

  private buildVotingForm() {
    var allocatedShares = 0;
    if (this.shareholder){
      allocatedShares =this.shareholder.numberOfShares;
    }

    if (this.proxy){

      
        allocatedShares = this.proxy.allocatedShares;
      
    }    

    console.log(this.event.resolutions);
    const result = this.event.resolutions.map((resolution) => {
      //const isCdsInAbstainArray = resolution.abstainCDS && resolution.abstainCDS.includes(cdsvalue);
      var voteresponse = null ;
      // if (isCdsInAbstainArray){
      //   voteresponse = VotingResponseEnum.ABSTAIN;
      // }
      
      const votingResolutionForm: Record<keyof ResolutionVotingEntry, any> = {
        resolutionId: [resolution._id, Validators.required],
        response: [VotingResponseEnum.ABSTAIN, Validators.required],
        numberOfShares: [allocatedShares, Validators.required],
        maxnumberOfShares: [allocatedShares, Validators.required],
      };
      return this.fb.group(votingResolutionForm);
    });
    const voting: Partial<Record<keyof Voting, any>> = {
      result: this.fb.array(result),
    };
    this.votingForm = this.fb.group(voting);
  }

  public getResolutionVoting(index: number): ResolutionVotingEntry {
    return this.votingForm.get('result').value[index];
  }

  public updateNumberOfShares(index: number, shares: string) {
    this.votingForm.get(`result.${index}.numberOfShares`).patchValue(parseInt(shares));
  }

  public updateResponse(index: number, response: VotingResponseEnum) {
    this.votingForm.get(`result.${index}.response`).patchValue(response);
    console.log(this.votingForm.invalid, this.votingForm.value);
  }

  public get voteLabel(): string {
    switch (this.operation) {
      case VotingOperation.PROXY_VOTE:
      case VotingOperation.CHAIRMAN_VOTE_AS_PROXY:
        return 'Vote as Proxy';

      case VotingOperation.CHAIRMAN_VOTE_ON_BEHALF:
        return 'Vote on Behalf';
      case VotingOperation.SHAREHOLDER_VOTE:
        return 'Vote';

      default:
        return '';
    }
  }

  public get voteButtonEnable(): boolean {
    const isPollingActive = this.event.polling.status === PollingStatusEnum.START;
    const isProxyPreVote = this.proxy?.voteSetting?.isPreVote ?? false;
    const isFormValid = this.votingForm.valid;
  
    switch (this.operation) {
      case VotingOperation.PROXY_VOTE:
      case VotingOperation.CHAIRMAN_VOTE_AS_PROXY:
        return (isPollingActive || isProxyPreVote) && isFormValid;
  
      case VotingOperation.CHAIRMAN_VOTE_ON_BEHALF:
      case VotingOperation.SHAREHOLDER_VOTE:
        return isPollingActive && isFormValid;
  
      case VotingOperation.SHAREHOLDER_REVOTE_FOR_OWN_PROXY:
        return false;
  
      default:
        return false;
    }
  }

  public onVote() {
    if (this.votingForm.valid) {
      console.log(this.votingForm.value.result)
      for (let i = 0; i < this.votingForm.value.result.length; i++) {
        if (this.votingForm.value.result[i].numberOfShares>this.votingForm.value.result[i].maxnumberOfShares){
          this.messageSvc.add({
            key: 'toast',
            severity: 'error',
            summary: 'Exceeded amount of shares.',
            detail: this.votingForm.value.result[i].resolutionId,
          });

          return;
        }

      }
      this.onVoteEvent.emit(
        this.votingForm.value.result as ResolutionVotingEntry[]
      );
    }
  }

  private updateVotingShares(allocatedShares: number) {
    const votingDefaultValue = this.votingForm.get('result').value;
    this.votingForm.get('result').patchValue(
      votingDefaultValue.map((votingDefaultValue) => ({
        ...votingDefaultValue,
        numberOfShares: allocatedShares,
      }))
    );
  }
}
