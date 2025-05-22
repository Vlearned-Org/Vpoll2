import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Company as CompanyContract } from "@vpoll-shared/contract";
import { CompanyStatusEnum } from "@vpoll-shared/enum";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsMongoId, IsOptional, IsString, ValidateNested } from "class-validator";
import { AbstractModel } from "./abstract.model";
import { InternalFile } from "./file.model";
import { Address } from "./shared/address.model";

@modelOptions({ schemaOptions: { _id: false, timestamps: false } })
export class CompanyInformation {
  @IsOptional()
  @IsString()
  @prop({ default: "" })
  public registrationNumber: string;

  @ValidateNested({ always: true })
  @Type(() => Address)
  @prop({ type: Address, required: true, default: {} })
  public address: Address;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "InternalFile" })
  public logo: Ref<InternalFile>;

  @IsOptional()
  @IsEmail()
  @prop()
  public email: string;

  @IsOptional()
  @IsString()
  @prop()
  public phone: string;
}

export class Company extends AbstractModel implements CompanyContract {
  @IsString()
  @prop({ required: true, unique: true, uppercase: true })
  public name: string;

  @IsString()
  @prop({ required: true, unique: true, uppercase: true })
  public email: string;

  @IsEnum(CompanyStatusEnum)
  @prop({ required: true, enum: CompanyStatusEnum })
  public status: CompanyStatusEnum;

  @IsOptional()
  @ValidateNested({ always: true })
  @Type(() => CompanyInformation)
  @prop({ type: CompanyInformation, required: true, default: {} })
  public information?: CompanyInformation;
}
