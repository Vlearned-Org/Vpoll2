import { prop, Ref } from "@typegoose/typegoose";
import { Shareholder as ShareholderContract } from "@vpoll-shared/contract";
import { ShareholderTypeEnum } from "@vpoll-shared/enum";
import { IsAlphanumeric, IsBoolean, IsEnum, IsMongoId, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { Company, User } from ".";
import { AbstractModel } from "./abstract.model";
import { Event } from "./event.model";

export class Shareholder extends AbstractModel implements ShareholderContract {
  @IsMongoId()
  @prop({ required: true, ref: "Company" })
  public companyId: Ref<Company>;

  @IsMongoId()
  @prop({ required: true, ref: "Event" })
  public eventId: Ref<Event>;

  // Only available when the user signed up
  @prop()
  public userId?: Ref<User>;

  @IsString()
  @prop({ required: true, trim: true, uppercase: true })
  public name: string;

  @IsAlphanumeric()
  @prop({ required: true, trim: true })
  public identityNumber: string;

  @IsNumberString()
  @prop({ required: true, trim: true })
  public cds: string;

  @IsNumber()
  @prop({ required: true })
  public numberOfShares: number;

  @IsOptional()
  @IsBoolean()
  @prop({ required: true, default: false })
  public isLargeShareholder: boolean;

  @IsOptional()
  @IsEnum(ShareholderTypeEnum)
  @prop({
    required: true,
    enum: ShareholderTypeEnum,
    default: ShareholderTypeEnum.SHAREHOLDER
  })
  public shareholderType: ShareholderTypeEnum;

  @IsOptional()
  @IsString()
  @prop()
  public nationality?: string;

  @IsOptional()
  @IsString()
  @prop()
  public oldIC?: string;

  @IsOptional()
  @IsString()
  @prop()
  public pc?: string;

  @IsOptional()
  @IsString()
  @prop()
  public pbc?: string;
}
