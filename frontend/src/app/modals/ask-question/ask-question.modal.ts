import { Component, OnInit } from '@angular/core';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { UserEvent } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-ask-question',
  templateUrl: './ask-question.modal.html',
  styleUrls: ['./ask-question.modal.scss'],
})
export class AskQuestionModal implements OnInit {
  public question: string;

  constructor(
    private me: MeHttpService,
    private messageSvc: MessageService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {}

  askQuestion() {
    const event: UserEvent = this.config.data.event;
    this.me.askQuestion(event.event._id, this.question).subscribe((result) => {
      this.messageSvc.add({
        key: 'toast',
        severity: 'success',
        summary: `Question is submitted.`,
        detail: 'Success',
      });
      this.dialogRef.close();
    });
  }
}
