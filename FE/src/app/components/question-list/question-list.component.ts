import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { EventHttpService } from '@app/shared/http-services/event-http.service';
import {
  AuditContract,
  QuestionAuditDataContract,
  Role,
} from '@vpoll-shared/contract';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent implements OnInit {
  public questions: AuditContract<QuestionAuditDataContract>[];
  public loading = true;
  constructor(
    private eventContext: EventContextService,
    private eventHttpSvc: EventHttpService
  ) {}

  ngOnInit(): void {
    this.eventHttpSvc
      .getEventQuestions(this.eventContext.eventId)
      .subscribe((questions) => {
        this.questions = questions;
        console.log(this.questions);
        this.loading = false;
      });
  }

  getRoleList(roles: Role[]) {
    return [...new Set(roles.map((r) => r.role))];
  }
}
