import { Company, User } from ".";
import { ShareholderTypeEnum } from "../enum/shareholder.enum";
import { Event } from "./event.interface";

export interface ImportShareholdersScope {
  senderId: string;
  companyId: string;
  eventId: string;
}

export interface Shareholder {
  _id: string;
  companyId: string | Company;
  eventId: string | Event;
  userId?: string | User;
  name: string;
  identityNumber: string;
  cds: string;
  numberOfShares: number;
  isLargeShareholder: boolean;
  shareholderType: ShareholderTypeEnum;
  nationality?: string;
  oldIC?: string;
  pc?: string;
  pbc?: string;
}

export interface ShareUtilization {
  totalShares: number;
  utilizedShares: number;
  remainderShares: number;
  allocatedShares: Array<{
    shares: number;
    proxyId: string;
  }>;
}
