import { prop, Ref } from "@typegoose/typegoose";
import { Corporate as CorporateContract } from "@vpoll-shared/contract";
import { IsMongoId, IsString } from "class-validator";
import { Company } from ".";
import { AbstractModel } from "./abstract.model";
import { Event } from "./event.model";

export class Corporate extends AbstractModel implements CorporateContract {
  @IsMongoId()
  @prop({ required: true, ref: "Company" })
  public companyId: Ref<Company>;

  @IsMongoId()
  @prop({ required: true, ref: "Event" })
  public eventId: Ref<Event>;

  @IsString()
  @prop({ required: true, trim: true, uppercase: true })
  public name: string;

  @IsString()
  @prop({ required: true, trim: true, uppercase: true })
  public email: string;

  @IsString()
  @prop({ required: true, trim: true, uppercase: true })
  public company: string;

  @IsString()
  @prop({ required: true })
  public mobile: string;
}
