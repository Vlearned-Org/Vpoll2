import { Component, OnInit } from '@angular/core';
import { ProxyModal } from '@app/modals/proxy/proxy.modal';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { ProxyHttpService } from '@app/shared/http-services/proxy-http.service';
import { Proxy } from '@vpoll-shared/contract';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-proxy-table',
  templateUrl: './proxy-table.component.html',
  styleUrls: ['./proxy-table.component.scss'],
})
export class ProxyTableComponent implements OnInit {
  public proxies: Proxy[];

  constructor(
    private dialogService: DialogService,
    public eventContext: EventContextService,
    private proxyHttpSvc: ProxyHttpService
  ) {}

  ngOnInit(): void {
    this.proxyHttpSvc
      .listProxies(this.eventContext.eventId)
      .subscribe((proxies) => {
        this.proxies = proxies;
      });
  }

  public createProxy() {
    const dialogRef = this.dialogService.open(ProxyModal, {
      header: 'Create Proxy',
      width: '100vw',
      height: '100vh',
      styleClass: 'fullscreen',
      data: {
        operation: ModalOperationEnum.CREATE,
        closeDialog: () => dialogRef.close(),
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.ngOnInit();
    });
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
            closeDialog: () => dialogRef.close(),
            shareholder: proxy.shareholderId,
            proxy,
            voting,
          },
        });
        dialogRef.onClose.subscribe(() => {
          this.ngOnInit();
        });
      });
  }
}
