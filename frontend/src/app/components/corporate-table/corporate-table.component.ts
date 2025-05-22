import { Component, OnInit } from '@angular/core';
import { CorporateModal } from '@app/modals/corporate/corporate.modal';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { CorporateHttpService } from '@app/shared/http-services/corporate-http.service';
import { Event, Corporate } from '@vpoll-shared/contract';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-corporate-table',
  templateUrl: './corporate-table.component.html',
  styleUrls: ['./corporate-table.component.scss'],
})
export class CorporateTableComponent implements OnInit {
  public event: Event;
  public corporates: Array<Corporate>;

  constructor(
    public eventContext: EventContextService,
    private dialogService: DialogService,
    private corporateHttpSvc: CorporateHttpService
  ) {}

  ngOnInit(): void {
    this.corporateHttpSvc
      .listCorporates(this.eventContext.eventId)
      .subscribe((corporates) => {
        this.event = this.eventContext.event;
        this.corporates = corporates;
      });
  }

  public createCorporate() {
    const dialogRef = this.dialogService.open(CorporateModal, {
      header: 'Create Corporate Representative',
      width: '60%',
      data: {
        operation: ModalOperationEnum.CREATE,
        event: this.event,
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.ngOnInit();
    });
  }

  public editCorporate(corporate: Corporate) {
    const dialogRef = this.dialogService.open(CorporateModal, {
      header: 'View and Edit Corporate',
      width: '60%',
      data: {
        operation: ModalOperationEnum.UPDATE,
        event: this.event,
        corporate,
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.ngOnInit();
    });
  }
}
