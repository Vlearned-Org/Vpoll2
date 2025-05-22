import { Company } from ".";
import { Event } from "./event.interface";

export interface Invitee {
  _id: string;
  companyId: string | Company;
  eventId: string | Event;
  name: string;
  email: string;
  mobile: string;
}

export interface AddInvitee {
  name: string;
  email: string;
  mobile: string;
}
