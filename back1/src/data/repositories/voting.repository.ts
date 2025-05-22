import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { Voting } from "../model/voting.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class VotingRepository extends AbstractRepository<Voting> {
  constructor(
    @InjectModel(Voting)
    protected readonly model: ReturnModelType<typeof Voting>
  ) {
    super(model);
  }
}
