import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { AuditTypeEnum } from "@vpoll-shared/enum";
import { InjectModel } from "nestjs-typegoose";
import { AttendanceAuditData, Audit, AuditData, EventAuditData, QuestionAuditData, UserAuditData, VoteAuditData,LeaveAuditData } from "../model/audit.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class AuditRepository extends AbstractRepository<Audit<AuditData>> {
  constructor(@InjectModel(Audit) protected readonly model: ReturnModelType<typeof Audit>) {
    super(model);
  }

  public async listAttendance(eventId: string): Promise<Audit<AttendanceAuditData>[]> {
    return this.all({ eventId, "data.type": AuditTypeEnum.ATTENDANCE }) as any;
  }

  public async listLeave(eventId: string): Promise<Audit<LeaveAuditData>[]> {
    return this.all({ eventId, "data.type": AuditTypeEnum.LEAVE }) as any;
  }

  public async listQuestion(eventId: string): Promise<Audit<QuestionAuditData>[]> {
    return this.all({ eventId, "data.type": AuditTypeEnum.QUESTION }) as any;
  }

  public async logEvent(event: Audit<EventAuditData>): Promise<Audit<EventAuditData>> {
    return this.model.create(event) as any;
  }

  public async logAttendance(attendance: Audit<AttendanceAuditData>): Promise<Audit<AttendanceAuditData>> {
    return this.model.create(attendance) as any;
  }

  public async logLeave(leave: Audit<LeaveAuditData>): Promise<Audit<LeaveAuditData>> {
    return this.model.create(leave) as any;
  }

  public async logQuestion(question: Audit<QuestionAuditData>): Promise<Audit<QuestionAuditData>> {
    return this.model.create(question) as any;
  }

  public async logVoting(vote: Audit<VoteAuditData>): Promise<Audit<VoteAuditData>> {
    return this.model.create(vote) as any;
  }

  public async logUserCreation(users: Audit<UserAuditData>[]): Promise<UserAuditData> {
    return this.bulk(users) as any;
  }
}
