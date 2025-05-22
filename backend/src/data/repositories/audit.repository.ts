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
    try {
      // Ensure all ObjectIds are properly converted to strings for nested objects
      if (question.data && question.data.roles) {
        question.data.roles = question.data.roles.map(role => {
          const sanitizedRole = {
            role: role.role,
            companyId: typeof role.companyId === 'object' ? role.companyId.toString() : role.companyId,
            eventId: typeof role.eventId === 'object' ? role.eventId.toString() : role.eventId,
            refId: null as string | null
          };
          
          if (role.refId) {
            // Using non-null assertion since we've already checked it's not null
            sanitizedRole.refId = typeof role.refId === 'object' ? role.refId!.toString() : role.refId;
          }
          
          return sanitizedRole;
        });
      }
      
      // Make sure the question object is properly structured for MongoDB
      if (question._id === null) {
        delete question._id; // Let MongoDB create a new ID
      }
      
      // Log valid question data before creating
      console.log("About to save question:", JSON.stringify({
        _id: question._id,
        eventId: question.eventId,
        userId: question.userId,
        question: question.data?.question,
        name: question.data?.name,
        roles: question.data?.roles
      }));
      
      // Create the document
      const result = await this.model.create(question);
      console.log(`Question successfully logged with ID: ${result?._id || 'unknown'}`);
      return result as any;
    } catch (error) {
      console.error(`Error in logQuestion: ${error.message}`);
      console.error(error.stack);
      throw error;
    }
  }

  public async logVoting(vote: Audit<VoteAuditData>): Promise<Audit<VoteAuditData>> {
    return this.model.create(vote) as any;
  }

  public async logUserCreation(users: Audit<UserAuditData>[]): Promise<UserAuditData> {
    return this.bulk(users) as any;
  }
}

