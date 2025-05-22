import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventModal } from '@app/modals/event/event.modal';
import { ModalOperationEnum } from '@app/shared/enums/modal-operation.enum';
import { EventHttpService } from '@app/shared/http-services/event-http.service';
import { Event } from '@vpoll-shared/contract';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { BehaviorSubject, EMPTY, forkJoin, Observable, tap } from 'rxjs';
import { RoleEnum } from '@vpoll-shared/enum';
import { IdentityService } from '@app/shared/security/services/identity.service';

import {
  AdminJwtToken,
  Company,
  JwtToken,
  UserJwtToken,
} from '@vpoll-shared/contract';

@Component({
  selector: 'app-company-events',
  templateUrl: './company-events.component.html',
  styleUrls: ['./company-events.component.scss'],
})
export class CompanyEventsComponent implements OnInit {
  public events: Event[];
  public loading = true;
  public context$ = new BehaviorSubject<JwtToken<any>>(null);
  public userId$ = new BehaviorSubject<string>(null);
  public company$ = new BehaviorSubject<Company>(null);
  public roles$ = new BehaviorSubject<RoleEnum[]>([]);
  public userName$ = new BehaviorSubject<string>('Hello');
  public isActive: boolean = true;

  constructor(
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private eventHttpSvc: EventHttpService,
    private identity: IdentityService,

    private messageSvc: MessageService,

    private jwtHelperSvc: JwtHelperService,
    private meHttpSvc: MeHttpService
  ) {}

  public ngOnInit() {
    this.eventHttpSvc.listEvents().subscribe((events) => {
      this.events = events;
      this.loading = false;
    });
    
    const token = localStorage.getItem('access_token');
    const context = this.jwtHelperSvc.decodeToken(token) as JwtToken<any>;
    if (!context || (context && !context.roles)) {
      this.clear();
      localStorage.clear();
      //this.router.navigate(['/']);
      //return EMPTY;
    }


    if (this.identity.company.status!="ACTIVE"){
      this.isActive = false;
    }
  }

  public clear(): void {
    this.userId$.next(null);
    this.company$.next(null);
    this.roles$.next(null);
  }

  public createEvent() {
    const dialogRef = this.dialogService.open(EventModal, {
      header: 'Create Event',
      width: '60%',
      data: { operation: ModalOperationEnum.CREATE },
    });
    dialogRef.onClose.subscribe((event) => {
      this.ngOnInit();
    });
  }

  public deleteEventConfirmation(event: Event) {
    this.confirmationService.confirm({
      key: 'confirmDelete',
      message: `Are you sure you want to delete ${event.name} event?`,
      accept: () => {
        this.eventHttpSvc.deleteEvent(event._id).subscribe((deletedEvent) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            detail: `Event ${event.name} deleted successfully.`,
          });
          this.ngOnInit();
        });
      },
    });
  }

  public eventDetails(event: Event) {
    this.router.navigate(['/admin/company/events/', event._id]);
  }
}
