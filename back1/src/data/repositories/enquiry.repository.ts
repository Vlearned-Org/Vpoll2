import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { Enquiry } from "../model/enquiry.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class EnquiryRepository extends AbstractRepository<Enquiry> {
  constructor(
    @InjectModel(Enquiry)
    protected readonly model: ReturnModelType<typeof Enquiry>
  ) {
    super(model);
  }

  // Add custom methods if required. For instance:
  public async findByEmail(email: string): Promise<Enquiry | null> {
    return this.model.findOne({ email });
  }

  // Other custom methods...
}
