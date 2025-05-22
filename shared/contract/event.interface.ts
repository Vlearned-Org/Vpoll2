import { ISODateTime } from "../type/date.type";
import { Company } from "./company.interface";
import { Corporate } from "./corporate.interface";
import { Invitee } from "./invitee.interface";
import { Proxy } from "./proxy.interface";
import { Resolution } from "./resolution.interface";
import { Shareholder } from "./shareholder.interface";
import { ResolutionVotingEntry } from "./voting.interface";

export enum PollingStatusEnum {
  NOT_STARTED = "not-started",
  START = "start",
  END = "end",
  PUBLISH = "publish",
}

export interface Polling {
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  status: PollingStatusEnum;
}

export interface EventSetting {
  wowzaSdpUrl: string;
  wowzaApplicationName: string;
  wowzaStreamName: string;

  proxyRegstrCutOffTime: ISODateTime;
  calculateResultBy?: string;
  noOfProxy?: number;
  enableProxyRegstr?: boolean;
  enableQuestion?: boolean;
}

export interface Event {
  _id: string;
  companyId: string | Company;
  isDeleted?: boolean;
  name: string;
  description: string;
  startAt: ISODateTime;
  endAt: ISODateTime;
  noticeOfAgmUrl: string;
  annualReportUrl: string;
  polling: Polling;
  setting: EventSetting;
  resolutions: Array<Resolution>;
}

export interface ChairmanIdentity {
  isChairman: boolean;
  hasProxies: boolean;
  proxies: Proxy[];
  secondProxies: Proxy[];
}

export interface ShareholderIdentity {
  isShareholder: boolean;
  shareholders: Array<Shareholder & { remainderShares: number }>;
  proxies: Proxy[];
}

export interface ProxyIdentity {
  isProxy: boolean;
  proxies: Proxy[];
}

export interface CorporateIdentity {
  isCorporate: boolean;
  corporate: Corporate;
}

export interface InviteeIdentity {
  isInvitee: boolean;
  invitee: Invitee;
}

export interface UserEvent {
  company: {
    name: string;
    logo: string;
  };
  event: Event;
  chairmanIdentity: ChairmanIdentity;
  shareholderIdentity: ShareholderIdentity;
  proxyIdentity: ProxyIdentity;
  inviteeIdentity: InviteeIdentity;
  corporateIdentity: CorporateIdentity;
}

export interface AskQuestionData {
  question: string;
}

export interface VotingData {
  type: "PROXY" | "SHAREHOLDER" ;
  refId: string;
  voting: ResolutionVotingEntry[];
}

export interface PublicEvent {
  companyId: string;
  eventId: string;
  name: string;
  description: string;
  logo: string;
  startAt: ISODateTime;
  endAt: ISODateTime;
  noticeOfAgmUrl: string;
  annualReportUrl: string;
}
