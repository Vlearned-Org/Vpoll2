import { Component, OnInit, ViewChild } from '@angular/core';
import { FileImportModal } from '@app/modals/file-import/file-import.modal';
import { ProxyModal } from '@app/modals/proxy/proxy.modal';
import { ShareholderModal } from '@app/modals/shareholder/shareholder.modal';
import { VoteOnBehalfModal } from '@app/modals/vote-on-behalf/vote-on-behalf.modal';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { ProxyHttpService } from '@app/shared/http-services/proxy-http.service';
import { ShareholderHttpService } from '@app/shared/http-services/shareholder-http.service';
import { ShareholderClear } from '@app/store/actions/shareholder.action';
import { Store } from '@ngxs/store';
import {
  Event,
  FileTypeEnum,
  Proxy,
  Shareholder,
} from '@vpoll-shared/contract';
import { saveAs } from 'file-saver';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';
import { map } from 'rxjs';

@Component({
  selector: 'app-shareholder-table',
  templateUrl: './shareholder-table.component.html',
  styleUrls: ['./shareholder-table.component.scss'],
})
export class ShareholderTableComponent implements OnInit {
  @ViewChild('shareholderActionMenu') public shareholderActionMenu: Menu;
  public event: Event;
  public shareholders: Array<Shareholder>;
  public proxies: Array<Proxy>;

  public uploadedFiles = [];
  public loading = true;

  public cdsList = [];

  public rowData: Shareholder;

  public shareholderActionMenuItem: MenuItem[] = [
    {
      label: 'Shareholder Details',
      command: () => {
        this.triggerEditShareholderModal(this.rowData);
      },
    },
    {
      label: 'Vote On Behalf',
      command: () => {
        this.triggerVoteOnShareholderBehalfModal(this.rowData);
      },
    },
    {
      label: 'Add Proxy',
      command: () => {
        this.triggerCreateProxyModal(this.rowData);
      },
    },
  ];

  constructor(
    private eventContext: EventContextService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private shareholderHttpSvc: ShareholderHttpService,
    private proxyHttpSvc: ProxyHttpService,
    private store: Store
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loading = true;
    this.event = this.eventContext.event;
    this.shareholders = this.eventContext.shareholders;

    this.cdsList = this.shareholders.map(shareholder => shareholder.cds);


    this.reloadProxies().subscribe(() => {
      this.loading = false;
    });
  }

  private reloadProxies() {
    return this.proxyHttpSvc.listProxies(this.eventContext.eventId).pipe(
      map((proxies) => {
        this.proxies = proxies;
      })
    );
  }

  public get totalNumberOfShares() {
    return this.shareholders.reduce(
      (acc, shareholder) => acc + shareholder.numberOfShares,
      0
    );
  }

  public triggerCreateShareholderModal() {
    const dialogRef = this.dialogService.open(ShareholderModal, {
      header: 'Create Shareholder',
      width: '60%',
      data: {
        operation: ModalOperationEnum.CREATE,
        existingcds : this.cdsList,
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.eventContext.reloadEventShareholders().subscribe((shareholders) => {
        this.shareholders = shareholders;
      });
    });
  }

  public triggerEditShareholderModal(shareholder: Shareholder) {
    const dialogRef = this.dialogService.open(ShareholderModal, {
      header: 'Edit Shareholder',
      width: '60%',
      data: {
        operation: ModalOperationEnum.UPDATE,
        shareholder,
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.eventContext.reloadEventShareholders().subscribe((shareholders) => {
        this.shareholders = shareholders;
      });
    });
  }

  public importShareholders() {
    const dialogRef = this.dialogService.open(FileImportModal, {
      header: 'Import Shareholders',
      width: '50%',
      data: { fileType: FileTypeEnum.SHAREHOLDER, event: this.event },
    });
    dialogRef.onClose.subscribe(() => {
      this.ngOnInit();
      // this.eventContext.reloadEventShareholders().subscribe((shareholders) => {
      // });
    });
  }

  public triggerCreateProxyModal(shareholder: Shareholder) {
    const dialogRef = this.dialogService.open(ProxyModal, {
      header: 'Create Proxy',
      width: '100vw',
      height: '100vh',
      styleClass: 'fullscreen',
      data: {
        operation: ModalOperationEnum.CREATE,
        shareholder,
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.reloadProxies().subscribe();
    });
  }

  public triggerActionMenu(event, rowData) {
    this.rowData = rowData;
    this.shareholderActionMenu.toggle(event);
  }

  public triggerClearShareholderModel() {
    this.confirmationService.confirm({
      key: 'confirmClear',
      message: 'Are you sure to clear all shareholders from this event?',
      accept: () => {
        this.shareholderHttpSvc
          .clearShareholders(this.event._id)
          .subscribe(() => {
            this.store.dispatch(ShareholderClear).subscribe(() => {
              this.eventContext.selectedEvent(this.event._id).subscribe(() => {
                this.ngOnInit();
              });
            });
          });
      },
    });
  }

  public getProxyNumber(shareholderId: string): Array<Proxy> {
    return this.proxies.filter(
      (proxy) => (proxy.shareholderId as Shareholder)._id === shareholderId
    );
  }

  public editProxy(proxy: Proxy) {
    this.proxyHttpSvc
      .getProxyVoting(this.eventContext.eventId, proxy._id)
      .subscribe((voting) => {
        const dialogRef = this.dialogService.open(ProxyModal, {
          header: 'View and Edit Proxy',
          width: '100vw',
          height: '100vh',
          styleClass: 'fullscreen',
          data: {
            operation: ModalOperationEnum.UPDATE,
            shareholder: proxy.shareholderId,
            proxy,
            voting,
          },
        });
        dialogRef.onClose.subscribe(() => {
          this.reloadProxies().subscribe();
        });
      });
  }

  public triggerVoteOnShareholderBehalfModal(shareholder: Shareholder) {
    const dialogRef = this.dialogService.open(VoteOnBehalfModal, {
      header: 'Vote on behalf of Shareholder',
      width: '100vw',
      height: '100vh',
      styleClass: 'fullscreen',
      data: {
        shareholder,
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }

  public downloadTemplate() {
    this.shareholderHttpSvc
      .getShareholderImportTemplate()
      .subscribe((stream) => {
        const blob = new Blob([stream], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;',
        });
        const fileName = `shareholder-import-template.xlsx`;
        saveAs(blob, fileName);
      });
  }
}
