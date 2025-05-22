import { Company, Event, Invitee,Corporate, Proxy, Shareholder, User, Voting } from "@app/data/model";
import { AttendanceAuditData, LeaveAuditData,Audit, QuestionAuditData } from "@app/data/model/audit.model";
import { ResolutionVotingResult } from "../../../../shared/contract/voting-report.interface";

export interface QuestionReportData extends ReportData<QuestionData> {}
export interface AttendanceReportData extends ReportData<AttendanceData> {}
export interface ProxyConsolidatedReportData extends ReportData<Array<Voting>> {}
export interface VotingReportData
  extends ReportData<{
    results: Array<ResolutionVotingResult>;
    votings: Array<Voting>;
  }> {}

export interface ReportData<T> {
  company: Company;
  event: Event;
  data: T;
}

export interface QuestionData {
  users: User[];
  questions: Audit<QuestionAuditData>[];
}

export interface AttendanceData {
  attendance: Audit<AttendanceAuditData>[];
  shareholders: Shareholder[];
  proxies: Proxy[];
  invitees: Invitee[];
  corporates: Corporate[];
  leave:  Audit<LeaveAuditData>[];
}

export interface InviteeAttendanceRowData {
  index: number;
  name: string;
  mobile: string;
  joinAt: Date;
  leaveAt: Date;
  duration: string;
}

export interface CorporateAttendanceRowData {
  index: number;
  name: string;
  mobile: string;
  joinAt: Date;
  leaveAt: Date;
  duration: string;
}

export interface ShareholderProxyAttendanceRowData {
  index: number;
  name: string;
  nric: string;
  joinAt: Date;
  leaveAt: Date;
  duration: string;
  cds: string;
  numberOfShares: number;
}


export interface InviteeLeaveRowData {
  index: number;
  name: string;
  mobile: string;
  leaveAt: Date;
}

export interface CorporateLeaveRowData {
  index: number;
  name: string;
  mobile: string;
  leaveAt: Date;
}

export interface ShareholderProxyLeaveRowData {
  index: number;
  name: string;
  nric: string;
  leaveAt: Date;
  cds: string;
  numberOfShares: number;
}
