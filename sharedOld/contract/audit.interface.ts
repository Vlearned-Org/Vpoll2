import {
  AuditTypeEnum,
  RoleEnum,
  VotingResponseEnum,
} from "@vpoll-shared/enum";
import { ISODateTime } from "@vpoll-shared/type/date.type";
import { Role } from "./context.interface";

export interface AuditContract<T> {
  eventId: string;
  userId: string;
  data: T;
}

export interface AuditDataContract {
  type: AuditTypeEnum;
}

export interface AttendanceAuditDataContract extends AuditDataContract {
  joinAt: ISODateTime;
  role: RoleEnum;
  ref: string;
  description: string;
}

export interface LeaveAuditDataContract extends AuditDataContract {
  leaveAt: ISODateTime;
  role: RoleEnum;
  ref: string;
  description: string;
}

export interface QuestionAuditDataContract extends AuditDataContract {
  question: string;
  roles: Role[];
  description: string;
}

export interface VoteAuditDataContract extends AuditDataContract {
  voterName: string;
  voterId: string;
  votingResult: VotingResponseEnum;
  shareholderId: string;
  resolutionId: string;
  description: string;
}

export interface UserAuditDataContract extends AuditDataContract {
  operation: string;
  type: AuditTypeEnum.USER;
  role: RoleEnum;
  ref: string;
  name: string;
  description: string;
}

export type AuditTypes =
  | AttendanceAuditDataContract
  | QuestionAuditDataContract
  | VoteAuditDataContract
  | LeaveAuditDataContract
  | UserAuditDataContract;
