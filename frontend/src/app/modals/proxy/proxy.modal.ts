import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { VotingOperation } from '@app/components/resolution-voting/resolution-voting.component';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { ProxyHttpService } from '@app/shared/http-services/proxy-http.service';
import { ShareholderHttpService } from '@app/shared/http-services/shareholder-http.service';
import {
  AddProxy,
  Event,
  InternalFile,
  Proxy,
  ResolutionVotingEntry,
  RichInternalFile,
  Shareholder,
  ShareUtilization,
  Voting,
} from '@vpoll-shared/contract';
import { ShareholderTypeEnum } from '@vpoll-shared/enum';
import { MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-proxy-modal',
  templateUrl: './proxy.modal.html',
  styleUrls: ['./proxy.modal.scss'],
})
export class ProxyModal implements OnInit {
  public proxyForm: FormGroup;
  public proxyFormFile: InternalFile;
  public loaded = false;

  // Data Context
  public event: Event;
  public chairmans: Array<Shareholder>;
  public shareholders: Array<Shareholder>;
  public shareUtilization: ShareUtilization;
  public remainderShares: number = 0;
  public utilizedShares: number = 0;

  // Input
  public operation: ModalOperationEnum;
  public proxy: Proxy;
  public voting: Voting;

  public ModalOperationEnum = ModalOperationEnum;
  public VotingOperation = VotingOperation;

  // State
  public disableShareholderSelect = false;
  public nameIDCdsDisableEdit = false;
  public selectedShareholder: Shareholder;
  public selectedChairmanId: string;

  // Options
  public shareholderOptions: SelectItem[];
  public chairmanOptions: SelectItem[];

  constructor(
    private fb: FormBuilder,
    private config: DynamicDialogConfig,
    private eventContext: EventContextService,
    private messageSvc: MessageService,
    private shareholderHttpSvc: ShareholderHttpService,
    private proxyHttpSvc: ProxyHttpService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.event = this.eventContext.event;
    this.shareholders = this.eventContext.shareholders;

    this.operation = this.config.data.operation;
    await this.initialize(this.config.data.shareholder);
  }

  public async initialize(shareholder: Shareholder) {
    this.selectedShareholder = shareholder;
    if (this.selectedShareholder) {
      this.disableShareholderSelect = true;
      this.shareUtilization = await this.shareholderHttpSvc
        .getShareholderShareUtilization(
          this.event._id,
          this.selectedShareholder._id
        )
        .toPromise();
    }
    if (this.operation === ModalOperationEnum.UPDATE) {
      this.proxy = this.config.data.proxy;
      this.proxyFormFile = this.proxy.proxyFormId;
      this.voting = this.config.data.voting;
      if (this.proxy.isChairmanAsProxy) {
        this.selectedChairmanId = this.proxy.shareholderAsProxyRefId as string;
      }

      const proxyShares = this.shareUtilization.allocatedShares.find(
        (p) => p.proxyId === this.proxy._id
      ).shares;
      this.remainderShares =
        this.shareUtilization.remainderShares + proxyShares;
      this.utilizedShares = this.shareUtilization.utilizedShares - proxyShares;
    } else {
      if (this.shareUtilization) {
        this.remainderShares = this.shareUtilization.remainderShares;
        this.utilizedShares = this.shareUtilization.utilizedShares;
      } else {
        this.remainderShares = 0;
        this.utilizedShares = 0;
      }
    }

    this.buildOptions();
    this.buildProxyForm();

    if (this.proxy) {
      this.patchProxyForm(this.proxy);
    }

    this.isChairmanAsProxy.valueChanges.subscribe((isChairmanAsProxy) => {
      this.nameIDCdsDisableEdit = !!isChairmanAsProxy;
    });

    this.loaded = true;
  }

  public removeProxyFormAttachment() {
    this.proxyFormId.patchValue(null);
  }

  public addProxyForm(file: RichInternalFile) {
    this.proxyFormFile = file;
    this.proxyFormId.patchValue(file._id);
  }

  public onChairmanSelect() {
    const chairman = this.shareholders.find(
      (shareholder) => shareholder._id === this.selectedChairmanId
    );
    this.patchProxyInfo(chairman);
  }

  public checkNricExisted(event) {
    const nric = event.target.value.trim().replace(/-/g, '');
    const shareholder = this.shareholders.find(
      (_shareholder) => _shareholder.identityNumber === nric
    );
    if (shareholder) {
      this.patchProxyInfo(shareholder);
    }
  }

  public createProxy() {
    console.log(this.proxyForm.value);
    if (this.proxyForm.valid) {
      const proxy = this.proxyForm.value as AddProxy;
      this.proxyHttpSvc.addProxy(this.event._id, proxy).subscribe((proxy) => {
        this.proxy = proxy;
        console.log(proxy);
        this.patchProxyForm(proxy);
        this.operation = ModalOperationEnum.UPDATE;

        
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Proxy created',
          detail: 'Success',
        });

        this.config.data.closeDialog();
      });
    }
  }

  public updateProxy() {
    console.log(this.proxyForm.value);
    if (this.proxyForm.valid) {
      const proxy = this.proxyForm.value as AddProxy;
      this.proxyHttpSvc
        .updateProxy(this.event._id, proxy._id, proxy)
        .subscribe((proxy) => {
          this.proxy = proxy;
          this.patchProxyForm(proxy);
          this.operation = ModalOperationEnum.UPDATE;

          this.config.data.closeDialog();
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            summary: 'Proxy updated',
            detail: 'Success',
          });


        });
    }
  }

  public async shareholderOnChange(shareholderId: string) {
    await this.initialize(
      this.shareholders.find((shareholder) => shareholder._id === shareholderId)
    );
  }

  public onProxyPrevote(result: ResolutionVotingEntry[]) {
    this.proxyHttpSvc
      .addProxyVoting(this.event._id, this.proxy._id, { result })
      .subscribe((voting) => {
        this.voting = voting;
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'You have successfully casted votes on all the resolutions',
          detail: 'Success',
        });
      });
  }

  private buildProxyForm() {
    const proxy: Record<keyof AddProxy, any> = {
      _id: [],
      eventId: [this.event._id, Validators.required],
      shareholderId: [
        this.selectedShareholder ? this.selectedShareholder._id : null,
        Validators.required,
      ],
      shareholderAsProxyRefId: [],
      allocatedShares: [
        0,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(this.remainderShares),
        ],
      ],
      isChairmanAsProxy: [false, Validators.required],
      name: [null, Validators.required],
      email: [null, Validators.required],
      identityNumber: [null, Validators.required],
      cds: [null, Validators.required],

      mobile: [null],
      proxyFormId: [null, Validators.required],
      voteSetting: this.fb.group({
        isPreVote: [false, Validators.required],
        chairmanVoteOnBehalf: [false, Validators.required],
      }),
    };

    this.proxyForm = this.fb.group(proxy);
  }

  private buildOptions() {
    this.shareholderOptions = [
      {
        label: 'Please select shareholder',
        value: null,
      },
      ...this.shareholders.map((shareholder) => {
        return {
          label: `${shareholder.name} ${shareholder.cds}`,
          value: shareholder._id,
        };
      }),
    ];

    this.chairmanOptions = [
      { label: 'Please select chairman', value: null },
      ...this.shareholders
        .filter(
          (shareholder) =>
            shareholder.shareholderType === ShareholderTypeEnum.CHAIRMAN
        )
        .map((shareholder) => {
          return {
            label: `${shareholder.name}`,
            value: shareholder._id,
          };
        }),
    ];
  }

  private patchProxyForm(proxy: Proxy) {
    this.proxyForm.patchValue({
      ...proxy,
      proxyFormId: proxy.proxyFormId._id,
      shareholderId: (proxy.shareholderId as Shareholder)._id,
    });
  }

  private patchProxyInfo(shareholder: Shareholder) {
    if (shareholder) {
      this.proxyForm.get('shareholderAsProxyRefId').patchValue(shareholder._id);
      this.proxyForm.get('name').patchValue(shareholder.name);
      this.proxyForm
        .get('identityNumber')
        .patchValue(shareholder.identityNumber);
      this.proxyForm.get('cds').patchValue(shareholder.cds);
    } else {
      this.proxyForm.get('shareholderAsProxyRefId').patchValue(null);
      this.proxyForm.get('name').patchValue(null);
      this.proxyForm.get('identityNumber').patchValue(null);
      this.proxyForm.get('cds').patchValue(null);
    }
  }

  public get isChairmanAsProxy(): AbstractControl {
    return this.proxyForm.get('isChairmanAsProxy');
  }

  public get proxyFormId(): AbstractControl {
    return this.proxyForm.get('proxyFormId');
  }

  public get insufficientShares(): boolean {
    return this.remainderShares < this.proxyForm.get('allocatedShares').value;
  }
}
