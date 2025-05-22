import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { Proxy } from "../model/proxy.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class ProxyRepository extends AbstractRepository<Proxy> {
  constructor(@InjectModel(Proxy) protected readonly model: ReturnModelType<typeof Proxy>) {
    super(model);
  }

  public async getShareholderProxies(companyId: string, eventId: string, shareholderId: string): Promise<Proxy[]> {
    return this.model.find({
      companyId,
      eventId,
      shareholderId
    });
  }

  public async deleteProxy(companyId: string, eventId: string, proxyId: string): Promise<Proxy> {
    return this.model.findOneAndUpdate(
      { companyId, eventId, _id: proxyId },
      { $set: { isDeleted: true } },
      {
        new: true
      }
    );
  }
}
