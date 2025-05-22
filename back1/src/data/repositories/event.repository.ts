import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { PollingStatusEnum } from "@vpoll-shared/contract";
import { InjectModel } from "nestjs-typegoose";
import { Polling } from "../model";
import { Event, Resolution } from "../model/event.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class EventRepository extends AbstractRepository<Event> {
  constructor(@InjectModel(Event) protected readonly model: ReturnModelType<typeof Event>) {
    super(model);
  }

  public async softDeleteEvent(eventId: string, companyId: string): Promise<Event> {
    return this.model.findOneAndUpdate(
      { _id: eventId, companyId },
      {
        $set: {
          isDeleted: true
        }
      }
    );
  }

  public async startPolling(eventId: string, companyId: string): Promise<Event> {
    return this.model.findOneAndUpdate(
      { _id: eventId, companyId },
      {
        $set: {
          polling: {
            status: PollingStatusEnum.START,
            startAt: new Date()
          } as Polling
        }
      }
    );
  }

  public async endPolling(eventId: string, companyId: string): Promise<Event> {
    return this.model.findOneAndUpdate(
      { _id: eventId, companyId },
      {
        $set: {
          "polling.status": PollingStatusEnum.END,
          "polling.endAt": new Date()
        }
      }
    );
  }

  public async publishPolling(eventId: string, companyId: string): Promise<Event> {
    return this.model.findOneAndUpdate(
      { _id: eventId, companyId },
      {
        $set: {
          "polling.status": PollingStatusEnum.PUBLISH
        }
      }
    );
  }

  public async addResolution(filters: { _id: string; companyId: string }, reso: Resolution): Promise<Event> {
    return this.model.findOneAndUpdate(filters, { $push: { resolutions: reso } }, { new: true, lean: true });
  }

  public async updateResolution(filters: { _id: string; companyId: string }, reso: Resolution): Promise<Event> {
    return this.model.findOneAndUpdate(
      filters,
      {
        $set: {
          "resolutions.$[t]": reso
        }
      },
      { new: true, arrayFilters: [{ "t._id": reso._id }] }
    );
  }

  public async deleteResolutionById(filters: { _id: string; companyId: string }, resolutionId: string): Promise<Event> {
    return this.model.findOneAndUpdate(filters, { $pull: { resolutions: { _id: resolutionId } } }, { new: true });
  }

  public async clearResolution(filters: { _id: string; companyId: string }): Promise<Event> {
    return this.model.findOneAndUpdate(filters, { $set: { resolutions: [] } }, { new: true });
  }
}
