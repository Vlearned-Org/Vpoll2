import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Event as EventContract, PollingStatusEnum, Resolution as ResolutionContract } from "@vpoll-shared/contract";
import { ResolutionTypeEnum } from "@vpoll-shared/enum";
import { ISODateTime } from "@vpoll-shared/type/date.type";
import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ObjectId } from "mongodb";
import { AbstractModel } from "./abstract.model";
import { Company } from "./company.model";

@modelOptions({ schemaOptions: { _id: false, timestamps: false } })
export class Polling {
  @IsOptional()
  @IsDateString()
  @prop()
  public startAt?: ISODateTime;

  @IsOptional()
  @IsDateString()
  @prop()
  public endAt?: ISODateTime;

  @IsOptional()
  @IsEnum(PollingStatusEnum)
  @prop({ enum: PollingStatusEnum, required: true, default: PollingStatusEnum.NOT_STARTED })
  public status: PollingStatusEnum;
}

@modelOptions({ schemaOptions: { _id: false, timestamps: false } })
export class EventSetting {
  @IsOptional()
  @IsString()
  @prop()
  public wowzaSdpUrl: string;

  @IsOptional()
  @IsString()
  @prop()
  public wowzaApplicationName: string;

  @IsOptional()
  @IsString()
  @prop()
  public wowzaStreamName: string;

  @IsOptional()
  @IsDateString()
  @prop()
  public proxyRegstrCutOffTime: ISODateTime;

  @IsOptional()
  @IsDateString()
  @prop()
  public corporateRegstrCutOffTime: ISODateTime;
}

@modelOptions({ schemaOptions: { timestamps: false } })
export class Resolution implements ResolutionContract {
  public _id: string;

  @IsNumber()
  @prop({ type: Number, required: true })
  public index: number;

  @IsEnum(ResolutionTypeEnum)
  @prop({ enum: ResolutionTypeEnum, required: true })
  public type: ResolutionTypeEnum;

  @IsString()
  @prop({ type: String, required: true })
  public title: string;

  @IsString({ each: true })
  @prop({ type: String, default: [] })
  public abstainCDS: Array<string>;
}

export class Event extends AbstractModel implements EventContract {
  @IsOptional()
  @IsMongoId()
  @prop({ ref: "Company", type: ObjectId, required: true })
  public companyId: Ref<Company>;

  @IsOptional()
  @IsBoolean()
  @prop({ required: true, type: Boolean, default: false })
  public isDeleted: boolean;

  @IsString()
  @prop({ required: true, trim: true, uppercase: true })
  public name: string;

  @IsString()
  @prop({ required: true })
  public description: string;

  @IsDateString()
  @prop({ type: Date, required: true })
  public startAt: ISODateTime;

  @IsDateString()
  @prop({ type: Date, required: true })
  public endAt: ISODateTime;

  @IsString()
  @prop({ required: true })
  public noticeOfAgmUrl: string;

  @IsString()
  @prop({ required: true })
  public annualReportUrl: string;

  @ValidateNested({ always: true })
  @Type(() => Polling)
  @prop({ required: true, type: Polling, default: {} })
  public polling: Polling;

  @ValidateNested({ always: true })
  @Type(() => EventSetting)
  @prop({ required: true, type: EventSetting, default: {} })
  public setting: EventSetting;

  @ValidateNested({ each: true })
  @Type(() => Resolution)
  @prop({ type: Resolution, default: [] })
  public resolutions: Array<Resolution>;
}
