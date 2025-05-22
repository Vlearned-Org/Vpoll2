import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { Corporate } from "../model/corporate.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class CorporateRepository extends AbstractRepository<Corporate> {
  constructor(
    @InjectModel(Corporate)
    protected readonly model: ReturnModelType<typeof Corporate>
  ) {
    super(model);
  }
}
