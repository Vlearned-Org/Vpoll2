import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { Invitee } from "../model/invitee.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class InviteeRepository extends AbstractRepository<Invitee> {
  constructor(
    @InjectModel(Invitee)
    protected readonly model: ReturnModelType<typeof Invitee>
  ) {
    super(model);
  }
}
