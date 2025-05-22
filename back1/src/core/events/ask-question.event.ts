import { Role } from "@app/data/model";

export class AskQuestionEvent {
  public companyId: string;
  public eventId: string;
  public question: string;
  public roles: Role[];

  constructor(companyId: string, eventId: string, question: string, roles: Role[]) {
    this.companyId = companyId;
    this.eventId = eventId;
    this.question = question;
    this.roles = roles;
  }
}
