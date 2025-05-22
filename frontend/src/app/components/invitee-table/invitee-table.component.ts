import { Component, OnInit } from '@angular/core';
import { InviteeModal } from '@app/modals/invitee/invitee.modal';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { InviteeHttpService } from '@app/shared/http-services/invitee-http.service';
import { Event, Invitee } from '@vpoll-shared/contract';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-invitee-table',
  templateUrl: './invitee-table.component.html',
  styleUrls: ['./invitee-table.component.scss'],
})
export class InviteeTableComponent implements OnInit {
  public event: Event;
  public invitees: Array<Invitee>;

  constructor(
    public eventContext: EventContextService,
    private dialogService: DialogService,
    private inviteeHttpSvc: InviteeHttpService
  ) {}

  ngOnInit(): void {
    this.inviteeHttpSvc
      .listInvitees(this.eventContext.eventId)
      .subscribe((invitees) => {
        this.event = this.eventContext.event;
        this.invitees = invitees;
      });
  }

  public createInvitee() {
    const dialogRef = this.dialogService.open(InviteeModal, {
      header: 'Create Invitee',
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

  public editInvitee(invitee: Invitee) {
    const dialogRef = this.dialogService.open(InviteeModal, {
      header: 'View and Edit Invitee',
      width: '60%',
      data: {
        operation: ModalOperationEnum.UPDATE,
        event: this.event,
        invitee,
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.ngOnInit();
    });
  }
}
