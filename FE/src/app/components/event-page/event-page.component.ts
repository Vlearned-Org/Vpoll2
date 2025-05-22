import { Component, OnDestroy, OnInit, ViewChild ,AfterViewInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventContextService } from '@app/services/event-context.service';
import { WebSocketService } from '@app/services/websocket.service';
import { Event } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { AuditLogComponent } from '../audit-log/audit-log.component';
import { DirectorTableComponent } from '../director-table/director-table.component';
import { ProxyTableComponent } from '../proxy-table/proxy-table.component';
import { ProxyVotingComponent } from '../proxy-voting/proxy-voting.component';
import { QuestionListComponent } from '../question-list/question-list.component';
import { ResolutionTableComponent } from '../resolution-table/resolution-table.component';
import { ShareholderTableComponent } from '../shareholder-table/shareholder-table.component';
import { CorporateTableComponent } from '../corporate-table/corporate-table.component';
@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.scss'],
})
export class EventPageComponent implements OnInit, OnDestroy ,AfterViewInit {
  @ViewChild(ShareholderTableComponent)
  public shareholderTab: ShareholderTableComponent;
  @ViewChild(DirectorTableComponent) public directorTab: DirectorTableComponent;
  @ViewChild(ResolutionTableComponent)
  public resolutionTab: ResolutionTableComponent;
  @ViewChild(ProxyTableComponent) public proxyTab: ProxyTableComponent;
  @ViewChild(ProxyVotingComponent) public proxyVotingTab: ProxyVotingComponent;
  @ViewChild(CorporateTableComponent) public corporateTab: CorporateTableComponent;
  @ViewChild(QuestionListComponent) public questionTab: QuestionListComponent;
  @ViewChild(AuditLogComponent) public auditTab: AuditLogComponent;

  public isFullScreen: boolean = false;
  public isLoaded = false;
  public event: Event;
  public tabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private eventContext: EventContextService,
    private websocketSvc: WebSocketService,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    this.websocketSvc.joinAdminEventRoom(eventId);
    this.eventContext.selectedEvent(eventId).subscribe((status) => {
      this.event = this.eventContext.event;
      this.isLoaded = status;
      console.log(this.event.polling.status);
    });
    this.websocketSvc.questionAsked((data) => {
      this.messageSvc.add({
        key: 'toast',
        severity: 'info',
        detail: `Question: ${data.question}`,
      });
      this.questionTab.ngOnInit();
    });
  }
  ngAfterViewInit(): void {
    console.log('AfterViewInit - corporateTab:', this.corporateTab);
  }
  public ngOnDestroy(): void {
    if (this.websocketSvc.joinedEvent) {
      this.websocketSvc.removeAskQuestionListener();
      this.websocketSvc.leaveAdminEventRoom();
    }
  }

  public changeTabIndex(index: number) {
    this.tabIndex = index;
  }

  public onTabChange(event) {
    console.log(this.proxyTab);
    console.log(this.corporateTab);
    switch (event.index) {
      
      case 0:
        // Dashboard
        break;
      case 1:
        this.shareholderTab.ngOnInit();
        break;
      case 2:
        this.directorTab.ngOnInit();
        break;
      case 3:
        this.resolutionTab.ngOnInit();
        break;
      case 4:
        this.proxyTab.ngOnInit();
        break;
      case 5:
        this.proxyVotingTab.ngOnInit();
        break;
      case 6:
       this.corporateTab.ngOnInit();
       break;
      case 8:
        this.questionTab.ngOnInit();
        break;
      case 9:
        this.auditTab.ngOnInit();
        break;
    }
  }
}
