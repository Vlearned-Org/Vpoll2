import { modelOptions, prop } from "@typegoose/typegoose";
import { IsOptional } from "class-validator";

@modelOptions({ schemaOptions: { _id: false, timestamps: false } })
export class Address {
  @IsOptional()
  @prop()
  public line1: string;

  @IsOptional()
  @prop()
  public line2?: string;

  @IsOptional()
  @prop()
  public country: string;

  @IsOptional()
  @prop()
  public countryZone?: string;

  @IsOptional()
  @prop()
  public zip: string;

  @IsOptional()
  @prop()
  public city: string;

  public readable(): string {
    return [this.line1, this.line2, this.zip, this.city].join(", ");
  }
}
