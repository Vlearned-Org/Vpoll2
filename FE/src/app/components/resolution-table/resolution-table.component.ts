import { Component, OnInit } from '@angular/core';
import { ResolutionModal } from '@app/modals/resolution/resolution.modal';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { ResolutionHttpService } from '@app/shared/http-services/resolution-http.service';
import { Event, Resolution, Shareholder } from '@vpoll-shared/contract';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-resolution-table',
  templateUrl: './resolution-table.component.html',
  styleUrls: ['./resolution-table.component.scss'],
})
export class ResolutionTableComponent implements OnInit {
  public event: Event;
  public resolutions: Resolution[];
  public shareholders: Shareholder[];

  public loading = true;

  constructor(
    private eventContext: EventContextService,
    private dialogService: DialogService,
    private resolutionHttpSvc: ResolutionHttpService,
    private messageSvc: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  public ngOnInit(): void {
    if (this.eventContext.isContextLoaded) {
      this.event = this.eventContext.event;
      this.shareholders = this.eventContext.shareholders;
      this.resolutions = this.event.resolutions.sort(
        (a, b) => a.index - b.index
      );
      this.loading = false;
    }
  }

  public abstainCdsNumber(resolution: Resolution) {
    return resolution.abstainCDS.length;
  }

  public createResolution() {
    const dialogRef = this.dialogService.open(ResolutionModal, {
      header: 'Create Resolution',
      width: '60%',
      data: {
        operation: ModalOperationEnum.CREATE,
        event: this.event,
        shareholders: this.shareholders,
      },
    });
    dialogRef.onClose.subscribe((event) => {
      this.eventContext.reloadEvent(event);
      this.event = event;
      this.resolutions = event.resolutions.sort((a, b) => a.index - b.index);
    });
  }

  public viewResolution(resolution: Resolution) {
    const dialogRef = this.dialogService.open(ResolutionModal, {
      header: 'View Resolution',
      width: '60%',
      data: {
        operation: ModalOperationEnum.UPDATE,
        event: this.event,
        resolution,
        shareholders: this.shareholders,
      },
    });
    dialogRef.onClose.subscribe((event) => {
      this.event = event;
      this.resolutions = event.resolutions.sort((a, b) => a.index - b.index);
    });
  }

  public deleteResolutionConfirmation(resolution: Resolution) {
    this.confirmationService.confirm({
      key: 'confirmDelete',
      message: `Are you sure you want to delete resolution number ${resolution.index}?`,
      accept: () => {
        this.resolutionHttpSvc
          .deleteResolution(this.event._id, resolution._id)
          .subscribe((event) => {
            this.messageSvc.add({
              key: 'toast',
              severity: 'success',
              detail: `Resolution ${
                resolution.index + 1
              } deleted successfully.`,
            });
            this.eventContext.reloadEvent(event);
            this.event = event;
            this.resolutions = event.resolutions.sort(
              (a, b) => a.index - b.index
            );
          });
      },
    });
  }
}
