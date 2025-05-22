import { Company } from ".";
import { Event } from "./event.interface";
export interface Corporate {
    _id: string;
    companyId: string | Company;
    eventId: string | Event;
    name: string;
    email: string;
    company: string;
    mobile: string;
}
export interface AddCorporate {
    name: string;
    email: string;
    company: string;
    mobile: string;
}
