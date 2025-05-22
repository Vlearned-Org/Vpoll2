import { modelOptions, prop } from "@typegoose/typegoose";
import { Enquiry as EnquiryContract } from "@vpoll-shared/contract";
import { IsEmail, IsString, IsOptional } from "class-validator";
import { AbstractModel } from "./abstract.model";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Enquiry extends AbstractModel implements EnquiryContract {
  @IsString()
  @prop({ required: true })
  public name: string;

  @IsEmail()
  @prop({ required: true })
  public email: string;

  @IsString()
  @IsOptional()
  @prop({ required: true })
  public phoneNumber: string;

  @IsString()
  @IsOptional()
  @prop()
  public companyName: string;

  @IsString()
  @prop({ required: true })
  public subject: string;

  @IsString()
  @prop({ required: true })
  public message: string;
}
