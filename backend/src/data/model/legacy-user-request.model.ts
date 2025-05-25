import { modelOptions, prop } from "@typegoose/typegoose";
import { Type } from "class-transformer";
import { IsString, IsOptional, IsEnum, IsDate } from "class-validator";
import { AbstractModel } from "./abstract.model";

export enum LegacyUserRequestStatus {
  PENDING = "pending",
  APPROVED = "approved", 
  REJECTED = "rejected",
  PROCESSED = "processed"
}

export enum LegacyUserRequestType {
  NEW_ACCOUNT = "new_account",
  PASSWORD_RESET = "password_reset", 
  ACCESS_HELP = "access_help",
  WALK_IN_ACCOUNT = "walk_in_account",
  OTHER = "other"
}

export enum PreferredContactMethod {
  PHONE = "phone",
  EMAIL = "email",
  POSTAL = "postal",
  IN_PERSON = "in_person"
}

@modelOptions({ 
  schemaOptions: { 
    timestamps: true,
    collection: "legacyuserrequests"
  } 
})
export class LegacyUserRequest extends AbstractModel {
  @prop({ required: true })
  @IsString()
  public name: string;

  @prop({ required: true })
  @IsString()
  public nric: string;

  @prop()
  @IsOptional()
  @IsString()
  public contactPersonName?: string;

  @prop()
  @IsOptional()
  @IsString()
  public contactPersonPhone?: string;

  @prop()
  @IsOptional()
  @IsString()
  public contactPersonEmail?: string;

  @prop()
  @IsOptional()
  @IsString()
  public contactPersonRelation?: string;

  @prop()
  @IsOptional()
  @IsString()
  public physicalAddress?: string;

  @prop({ 
    required: true,
    enum: PreferredContactMethod,
    type: () => String
  })
  @IsEnum(PreferredContactMethod)
  public preferredContactMethod: PreferredContactMethod;

  @prop({ 
    required: true,
    enum: LegacyUserRequestType,
    type: () => String
  })
  @IsEnum(LegacyUserRequestType)
  public requestType: LegacyUserRequestType;

  @prop({ required: true })
  @IsString()
  public message: string;

  @prop()
  @IsOptional()
  @IsString()
  public eventName?: string;

  @prop({ 
    default: LegacyUserRequestStatus.PENDING,
    enum: LegacyUserRequestStatus,
    type: () => String
  })
  @IsEnum(LegacyUserRequestStatus)
  public status: LegacyUserRequestStatus;

  @prop()
  @IsOptional()
  @IsString()
  public adminNotes?: string;

  @prop()
  @IsOptional()
  @IsString()
  public processedBy?: string;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public processedAt?: Date;

  @prop()
  @IsOptional()
  @IsString()
  public rejectionReason?: string;

  @prop()
  @IsOptional()
  @IsString()
  public createdUserId?: string;

  @prop()
  @IsOptional()
  @IsString()
  public visitLocation?: string;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public visitDate?: Date;

  @prop()
  @IsOptional()
  @IsString()
  public assistedBy?: string;

  @prop({ default: false })
  public isWalkIn?: boolean;
}