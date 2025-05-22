import { ImportStatusEnum } from "@vpoll-shared/contract";

export class ShareholderImportProgressEvent {
  public companyId: string;
  public eventId: string;
  public status: ImportStatusEnum;
  public progress: number;

  constructor(companyId: string, eventId: string, status: ImportStatusEnum, progress: number = 0) {
    this.companyId = companyId;
    this.eventId = eventId;
    this.status = status;
    this.progress = progress;
  }
}
