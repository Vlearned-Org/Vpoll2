import { ResolutionTypeEnum } from "../enum/resolution.enum";
import { Event } from "./event.interface";

export interface Resolution {
  _id: string;
  index: number;
  type: ResolutionTypeEnum;
  title: string;
  abstainCDS: Array<string>;
}

export interface EventResolution {
  _id: string;
  eventId: string | Event;
  resolutions: Array<Resolution>;
}
