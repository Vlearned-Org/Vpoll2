import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { EventModal } from '@app/modals/event/event.modal';
import { PasswordConfirmationModal } from '@app/modals/password-confirmation/password-confirmation.modal';
import { EventContextService } from '@app/services/event-context.service';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { EventHttpService } from '@app/shared/http-services/event-http.service';
import {
  Event,
  PollingStatusEnum,
  ResolutionVotingResult,
} from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, switchMap, takeUntil, timer } from 'rxjs';

enum EventDashboardTabEnum {
  SHAREHOLDER = 'shareholder',
  DIRECTOR = 'director',
  RESOLUTION = 'resolution',
  PROXY = 'proxy',
  PROXY_VOTING = 'proxy-voting',
  INVITEE = 'invitee',
}

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.scss'],
})
export class EventDashboardComponent implements OnInit, OnDestroy {
  public event: Event;
  public EventDashboardTabEnum = EventDashboardTabEnum;
  public PollingStatusEnum = PollingStatusEnum;
  public votingResult: ResolutionVotingResult[];
  @Output() tabTriggerEvent: EventEmitter<number> = new EventEmitter<number>();

  private stopPolling = new Subject();

  constructor(
    private dialogService: DialogService,
    private eventContextSvc: EventContextService,
    private eventHttpSvc: EventHttpService,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.event = this.eventContextSvc.event;
    if (this.event.polling.status === PollingStatusEnum.START) {
      this.resultPooling();
    } else if (
      this.event.polling.status === PollingStatusEnum.END ||
      this.event.polling.status === PollingStatusEnum.PUBLISH
    ) {
      this.eventHttpSvc
        .getEventVotingResult(this.eventContextSvc.eventId)
        .subscribe((result) => {
          this.votingResult = result;
        });
    }
  }

  ngOnDestroy() {
    this.stopPolling.next(null);
  }

  public editEvent() {
    const dialogRef = this.dialogService.open(EventModal, {
      header: 'Update Event',
      width: '60%',
      data: { operation: ModalOperationEnum.UPDATE, event: this.event },
    });
    dialogRef.onClose.subscribe((event) => {
      if (event) {
        this.event = event;
        this.eventContextSvc.reloadEvent(event);
      }
    });
  }

  public triggerTab(tab: EventDashboardTabEnum) {
    switch (tab) {
      case EventDashboardTabEnum.SHAREHOLDER:
        this.tabTriggerEvent.emit(1);
        break;
      case EventDashboardTabEnum.DIRECTOR:
        this.tabTriggerEvent.emit(2);
        break;
      case EventDashboardTabEnum.RESOLUTION:
        this.tabTriggerEvent.emit(3);
        break;
      case EventDashboardTabEnum.PROXY:
        this.tabTriggerEvent.emit(4);
        break;
      case EventDashboardTabEnum.PROXY_VOTING:
        this.tabTriggerEvent.emit(5);
        break;
      case EventDashboardTabEnum.INVITEE:
        this.tabTriggerEvent.emit(6);
        break;
    }
  }

  public resultPooling() {
    timer(1, 5000)
      .pipe(
        switchMap(() =>
          this.eventHttpSvc.getEventVotingResult(this.eventContextSvc.eventId)
        ),
        takeUntil(this.stopPolling)
      )
      .subscribe((result) => {
        this.votingResult = result;
      });
  }

  public startPolling() {
    const dialogRef = this.dialogService.open(PasswordConfirmationModal, {
      header: 'Confirm Action',
      width: '500px',
      data: { action: 'start polling' },
    });

    dialogRef.onClose.subscribe((password) => {
      if (password) {
        this.eventHttpSvc
          .startEventPolling(this.eventContextSvc.eventId, password)
          .subscribe({
            next: (event) => {
              this.event = event;
              this.eventContextSvc.reloadEvent(event);
              this.messageSvc.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Polling started successfully'
              });
            },
            error: (error) => {
              console.error('Start polling error:', error);
              let errorMessage = 'Failed to start polling.';
              
              if (error.status === 403 && error.error?.message === 'Invalid password') {
                errorMessage = 'Invalid password. Please check your password and try again.';
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              }
              
              this.messageSvc.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
              });
            }
          });
      }
    });
  }

  public endPolling() {
    const dialogRef = this.dialogService.open(PasswordConfirmationModal, {
      header: 'Confirm Action',
      width: '500px',
      data: { action: 'end polling' },
    });

    dialogRef.onClose.subscribe((password) => {
      if (password) {
        this.eventHttpSvc
          .endEventPolling(this.eventContextSvc.eventId, password)
          .subscribe({
            next: (event) => {
              this.event = event;
              this.eventContextSvc.reloadEvent(event);
              this.stopPolling.next(null);
              this.eventHttpSvc
                .getEventVotingResult(this.eventContextSvc.eventId)
                .subscribe((result) => {
                  this.votingResult = result;
                });
              this.messageSvc.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Polling ended successfully'
              });
            },
            error: (error) => {
              console.error('End polling error:', error);
              let errorMessage = 'Failed to end polling.';
              
              if (error.status === 403 && error.error?.message === 'Invalid password') {
                errorMessage = 'Invalid password. Please check your password and try again.';
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              }
              
              this.messageSvc.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage
              });
            }
          });
      }
    });
  }

  public publishPollingResult() {
    console.log("Starting publish polling result");
    this.eventHttpSvc
      .publishEventPolling(this.eventContextSvc.eventId)
      .subscribe(
        (event) => {
          console.log("Publish polling successful:", event);
          this.event = event;
          this.eventContextSvc.reloadEvent(event);
          // Only reload after the API call is successful
          console.log("Reloading page...");
          setTimeout(() => location.reload(), 300); // Small delay to ensure state is updated
        },
        (error) => {
          console.error("Failed to publish polling result:", error);
          // Handle error case
        }
      );
  }
}
