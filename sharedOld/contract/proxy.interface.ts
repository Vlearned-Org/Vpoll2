import { Company } from "./company.interface";
import { Event } from "./event.interface";
import { InternalFile } from "./filesystem.interface";
import { Shareholder } from "./shareholder.interface";

export class AddProxy {
  _id: string;
  eventId: string;
  shareholderId: string;
  shareholderAsProxyRefId?: string;
  isChairmanAsProxy: boolean;
  allocatedShares: number;
  mobile?: string;
  proxyFormId: string;
  voteSetting: VoteSetting;
  name: string;
  email: string;
  cds?: string;
  identityNumber: string;
}

export interface VoteSetting {
  isPreVote: boolean;
  chairmanVoteOnBehalf: boolean;
}

export interface Proxy {
  _id: string;
  companyId: string | Company;
  eventId: string | Event;
  shareholderId: string | Shareholder;
  shareholderAsProxyRefId?: string | Shareholder;
  allocatedShares: number;
  name: string;
  cds?: string;
  identityNumber: string;
  mobile?: string;
  isChairmanAsProxy: boolean;
  voteSetting: VoteSetting;
  proxyFormId?: InternalFile;
}
