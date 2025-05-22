import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { Shareholder } from "../model/shareholder.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class ShareholderRepository extends AbstractRepository<Shareholder> {
  constructor(
    @InjectModel(Shareholder)
    protected readonly model: ReturnModelType<typeof Shareholder>
  ) {
    super(model);
  }

  public async clear(companyId: string, eventId: string) {
    await this.model.deleteMany({
      companyId,
      eventId
    });
    return null;
  }
}
