import { prop, Ref } from "@typegoose/typegoose";
import { Proxy as ProxyContract } from "@vpoll-shared/contract";
import { Type } from "class-transformer";
import { IsBoolean, IsMongoId, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from "class-validator";
import { Company } from ".";
import { AbstractModel } from "./abstract.model";
import { Event } from "./event.model";
import { InternalFile } from "./file.model";
import { Shareholder } from "./shareholder.model";

export class VoteSetting {
  @IsBoolean()
  @prop({ required: true })
  public isPreVote: boolean;

  @IsBoolean()
  @prop({ required: true })
  public chairmanVoteOnBehalf: boolean;
}

export class Proxy extends AbstractModel implements ProxyContract {
  @IsMongoId()
  @prop({ required: true, ref: "Company" })
  public companyId: Ref<Company>;

  @IsMongoId()
  @prop({ ref: "Event", required: true })
  public eventId: Ref<Event>;

  @IsMongoId()
  @prop({ ref: "Shareholder", required: true, autopopulate: true })
  public shareholderId: Ref<Shareholder>;

  @IsMongoId()
  @prop({ ref: "Shareholder" })
  public shareholderAsProxyRefId?: Ref<Shareholder>;

  @IsNumber()
  @prop({ required: true })
  public allocatedShares: number;

  @IsString()
  @prop({ required: true, trim: true, uppercase: true })
  public name: string;

  @IsOptional()
  @IsNumberString()
  @prop({ trim: true })
  public cds?: string;


  @IsString()
  @prop({  required: true,trim: true })
  public email: string;

  @IsString()
  @prop({ required: true })
  public identityNumber: string;

  // @IsEnum(IdentityTypeEnum)
  // @prop({ required: true, enum: IdentityTypeEnum })
  // public identityType: IdentityTypeEnum;

  @IsOptional()
  @IsString()
  @prop()
  public mobile?: string;

  @IsBoolean()
  @prop({ required: true })
  public isChairmanAsProxy: boolean;

  @ValidateNested({ always: true })
  @Type(() => VoteSetting)
  @prop({ required: true, type: VoteSetting })
  public voteSetting: VoteSetting;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "InternalFile", required: true, autopopulate: true })
  public proxyFormId: InternalFile;
}
