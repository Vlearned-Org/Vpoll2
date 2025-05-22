import { prop } from "@typegoose/typegoose";
import { IsEmail, IsOptional, IsString, ValidateIf } from "class-validator";

export class Contact {
  @IsString()
  @prop({ required: true })
  public type: string;

  @IsString()
  @prop({ required: true })
  public name: string;

  @IsEmail()
  @IsOptional()
  @ValidateIf(o => o.email && o.email.length > 0)
  @prop()
  public email?: string;

  @IsOptional()
  @prop()
  public phone?: string;
}
