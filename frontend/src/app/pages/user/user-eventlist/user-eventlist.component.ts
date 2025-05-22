import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewPublishResultModal } from '@app/modals/view-publish-result/view-publish-result.modal';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { Event, PollingStatusEnum, User } from '@vpoll-shared/contract';
import * as moment from 'moment';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { IdentityService } from '@app/shared/security/services/identity.service';
@Component({
  selector: 'app-user-eventlist',
  templateUrl: './user-eventlist.component.html',
  styleUrls: ['./user-eventlist.component.scss'],
})
export class UserEventlistComponent implements OnInit {
  public loading = true;
  public events = [];
  private user: User;
  constructor(
    private me: MeHttpService,
    private router: Router,
    private dialogService: DialogService,
    private auth: AuthHttpService,
    private identity: IdentityService
  ) {}

  public ngOnInit(): void {
    forkJoin([this.me.getMe(), this.me.events(Math.random())]).subscribe(
      ([user, events]) => {
        this.user = user;
        this.events = events;
        this.loading = false;
        console.log(this.user);
        // this.auth
        // .refreshuser(this.user)
        // .subscribe(async (result) => {
        //   console.log(result);
        //   await this.identity.setup(result.token).toPromise();
        //   if (this.identity.isCommonUser) {
        //     this.router.navigate(['home']);
        //   }
        // });
      }
    );
    
  


  }

  public getEventRoles(eventId: string): string {
    return this.user.roles
      .filter((role) => role.eventId === eventId)
      .map((role) => role.role.toUpperCase())
      .join(', ');
  }

  public joinEvent(event: Event) {
    this.router.navigate([`/events/${event._id}`]);
  }

  public viewResult(event: Event) {
    const dialogRef = this.dialogService.open(ViewPublishResultModal, {
      header: `${event.name}'s Polling Result`,
      width: '90%',
      data: {
        event: event,
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }

  public isEventStarted(event: Event): boolean {
    const min15 = moment(event.startAt).subtract(60, 'minute');
    return moment().isSameOrAfter(min15);
  }

  public isEventEnded(event: Event): boolean {
    return moment().isAfter(event.endAt);
  }

  public isResultPublished(event: Event): boolean {
    return event.polling.status === PollingStatusEnum.PUBLISH;
  }
}
