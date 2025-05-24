import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { AccountVerificationStatusEnum, Role as RoleContract, Token as TokenContract, User as UserContract } from "@vpoll-shared/contract";
import { RoleEnum, UserStatusEnum, UserTokenEnum } from "@vpoll-shared/enum";
import { ISODateTime } from "@vpoll-shared/type/date.type";
import { Type } from "class-transformer";
import {
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from "class-validator";
import { AbstractModel } from "./abstract.model";
import { Company } from "./company.model";
import { Event } from "./event.model";
import { InternalFile } from "./file.model";

export class Token implements TokenContract {
  @IsEnum(UserTokenEnum)
  @prop({ required: true, enum: UserTokenEnum })
  public source: UserTokenEnum;

  @IsString()
  @prop({ required: true })
  public token: string;

  @IsOptional()
  @IsDate()
  @prop()
  public expiresAt?: ISODateTime;
}

@modelOptions({ schemaOptions: { timestamps: false } })
export class Role implements RoleContract {
  @IsEnum(RoleEnum)
  @prop({ required: true, enum: RoleEnum })
  public role: RoleEnum; // Can be switch to ObjectId when you have permissions

  @IsOptional()
  @IsMongoId()
  @prop({ required: true, ref: "Company" })
  public companyId?: Ref<Company>;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "Event" })
  public eventId?: Ref<Event>;

  @IsOptional()
  @IsMongoId()
  @prop()
  public refId?: string;
}

export class User extends AbstractModel implements UserContract {
  @IsBoolean()
  @prop({ default: false })
  public isAdmin: boolean;

  @IsOptional()
  @prop()
  public name?: string;

  @IsEnum(UserStatusEnum)
  @prop({ required: true, enum: UserStatusEnum })
  public status: UserStatusEnum;

  @IsArray()
  @Type(() => Token)
  @ValidateNested({ each: true })
  @prop({ type: Token, _id: false, default: [] })
  public tokens: Array<Token>;

  @IsArray()
  @Type(() => Role)
  @ValidateNested({ each: true })
  @prop({ type: Role, _id: false, default: [] })
  public roles: Array<Role>;

  @IsOptional()
  @IsDate()
  @prop()
  public firstLoginAt?: Date;

  @IsOptional()
  @IsDate()
  @prop()
  public lastLoginAt?: Date;

  @prop({ hide: true })
  public password: string;

  // Email is Mandatory for all users now
  @IsEmail()
  @prop({ trim: true, lowercase: true, required: true, unique: true })
  public email: string;

  // Mobile is now optional
  @IsOptional()
  @IsString()
  @prop({ trim: true })
  public mobile?: string;

  @IsAlphanumeric()
  @prop({ trim: true })
  public nric?: string;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "InternalFile", autopopulate: true })
  public nricRef?: InternalFile;

  @IsOptional()
  @IsEnum(AccountVerificationStatusEnum)
  @prop({ enum: AccountVerificationStatusEnum })
  public accountVerificationStatus?: AccountVerificationStatusEnum;

  @IsOptional()
  @IsString()
  @prop()
  public rejectMessage?: string;
}
