import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import {
  AttendanceAuditDataContract,
  AuditContract,
  QuestionAuditDataContract,
  UserAuditDataContract,
  VoteAuditDataContract,
  LeaveAuditDataContract
} from "@vpoll-shared/contract";
import { AuditTypeEnum, RoleEnum, VotingResponseEnum } from "@vpoll-shared/enum";
import { ISODateTime } from "@vpoll-shared/type/date.type";
import { ObjectId } from "bson";
import { AbstractModel } from "./abstract.model";
import { Role } from "./user.model";

@modelOptions({
  schemaOptions: {
    _id: false,
    discriminatorKey: "type",
    timestamps: false,
    id: false,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
  },
  options: { allowMixed: Severity.ALLOW }
})
export abstract class AuditData {
  @prop({ enum: AuditTypeEnum, required: true })
  public type: AuditTypeEnum;
}

export class AttendanceAuditData extends AuditData implements AttendanceAuditDataContract {
  public static create(joinAt: ISODateTime, role: RoleEnum, ref: string, name: string) {
    const data = new AttendanceAuditData();
    data.type = AuditTypeEnum.ATTENDANCE;
    data.joinAt = joinAt;
    data.role = role;
    data.ref = ref;
    data.name = name;
    return data;
  }

  @prop({ enum: AuditTypeEnum, required: true, default: AuditTypeEnum.ATTENDANCE })
  public type: AuditTypeEnum.ATTENDANCE;

  @prop({ type: Date, required: true })
  public joinAt: ISODateTime;

  @prop({ enum: RoleEnum })
  public role: RoleEnum;

  @prop({ type: ObjectId })
  public ref: string;

  @prop({ type: String })
  public name: string;

  public get description(): string {
    return `${this.name} with role ${this.role.toUpperCase()} attended event`;
  }
}

export class LeaveAuditData extends AuditData implements LeaveAuditDataContract {
  public static create(leaveAt: ISODateTime, role: RoleEnum, ref: string, name: string) {
    const data = new LeaveAuditData();
    data.type = AuditTypeEnum.LEAVE;
    data.leaveAt = leaveAt;
    data.role = role;
    data.ref = ref;
    data.name = name;
    return data;
  }

  @prop({ enum: AuditTypeEnum, required: true, default: AuditTypeEnum.LEAVE })
  public type: AuditTypeEnum.LEAVE;

  @prop({ type: Date, required: true })
  public leaveAt: ISODateTime;

  @prop({ enum: RoleEnum })
  public role: RoleEnum;

  @prop({ type: ObjectId })
  public ref: string;

  @prop({ type: String })
  public name: string;

  public get description(): string {
    return `${this.name} with role ${this.role.toUpperCase()} left event`;
  }
}

export class QuestionAuditData extends AuditData implements QuestionAuditDataContract {
  public static create(name: string, roles: Role[], question: string) {
    const data = new QuestionAuditData();
    data.type = AuditTypeEnum.QUESTION;
    data.question = question;
    data.name = name;
    data.roles = roles;
    console.log(roles);
    console.log(data.roles);
    return data;
  }
  @prop({ enum: AuditTypeEnum, required: true, default: AuditTypeEnum.QUESTION })
  public type: AuditTypeEnum.QUESTION;

  @prop({ type: String, required: true })
  public question: string;

  @prop({ type: Role, default: [] })
  public roles: Role[];

  @prop()
  public name: string;

  public get description(): string {
    return `${this.name} asked ${this.question}`;
  }
}

export class VoteAuditData extends AuditData implements VoteAuditDataContract {
  public static create(
    operation: "added" | "updated",
    payload: {
      voterName: string;
      voterId: string;
      votingResult: VotingResponseEnum;
      shareholderId: string;
      shareholderName: string;
      resolutionId: string;
      resolutionTitle: string;
    }
  ) {
    const data = new VoteAuditData();
    data.type = AuditTypeEnum.VOTE;
    data.operation = operation;
    data.voterName = payload.voterName;
    data.voterId = payload.voterId;
    data.votingResult = payload.votingResult;
    data.shareholderId = payload.shareholderId;
    data.shareholderName = payload.shareholderName;
    data.resolutionId = payload.resolutionId;
    data.resolutionTitle = payload.resolutionTitle;
    return data;
  }

  @prop({ type: String, required: true })
  public operation: string;

  @prop({ enum: AuditTypeEnum, required: true, default: AuditTypeEnum.VOTE })
  public type: AuditTypeEnum.VOTE;

  @prop()
  public voterName: string;
  @prop()
  public voterId: string;
  @prop()
  public votingResult: VotingResponseEnum;
  @prop()
  public shareholderId: string;
  @prop()
  public shareholderName: string;
  @prop()
  public resolutionId: string;
  @prop()
  public resolutionTitle: string;

  public get description(): string {
    return `${this.voterName} ${this.operation} vote (${this.votingResult}) ${this.resolutionTitle} on behalf of ${this.shareholderName}`;
  }
}

export class UserAuditData extends AuditData implements UserAuditDataContract {
  public static create(operation: "added" | "updated" | "deleted", payload: { role: RoleEnum; ref: string; name: string }) {
    const data = new UserAuditData();
    data.type = AuditTypeEnum.USER;
    data.operation = operation;
    data.role = payload.role;
    data.ref = payload.ref;
    data.name = payload.name;
    return data;
  }

  @prop()
  public operation: string;

  @prop({ enum: AuditTypeEnum, required: true, default: AuditTypeEnum.USER })
  public type: AuditTypeEnum.USER;

  @prop({ enum: RoleEnum })
  public role: RoleEnum;

  @prop({ type: ObjectId })
  public ref: string;

  @prop({ type: String })
  public name: string;

  public get description(): string {
    return `${this.role.toUpperCase()} (${this.name}) is ${this.operation}.`;
  }
}

export class EventAuditData extends AuditData {
  @prop({ enum: AuditTypeEnum, required: true, default: AuditTypeEnum.EVENT })
  public type: AuditTypeEnum.EVENT;

  @prop({ type: String })
  public description: string;
}

export class Audit<T extends AuditData> extends AbstractModel implements AuditContract<any> {
  @prop({ type: ObjectId, required: true })
  public eventId: string;

  @prop({ type: ObjectId })
  public userId: string;

  @prop({
    type: AuditData,
    discriminators: () => [
      { type: AttendanceAuditData, value: AuditTypeEnum.ATTENDANCE },
      { type: LeaveAuditData, value: AuditTypeEnum.LEAVE },
      { type: QuestionAuditData, value: AuditTypeEnum.QUESTION },
      { type: VoteAuditData, value: AuditTypeEnum.VOTE },
      { type: UserAuditData, value: AuditTypeEnum.USER },
      { type: EventAuditData, value: AuditTypeEnum.EVENT },

    ],
    _id: false
  })
  public data: T;
}
