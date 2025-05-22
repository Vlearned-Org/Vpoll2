import { modelOptions, prop } from "@typegoose/typegoose";
import { IsOptional, IsString } from "class-validator";

@modelOptions({ schemaOptions: { _id: false, timestamps: false } })
export class File {
  @IsString()
  @prop({ required: true })
  public name: string;

  @IsString()
  @prop({ required: true })
  public uri: string;

  @IsOptional()
  @prop()
  public extension: string;

  @IsOptional()
  @prop()
  public size: number;
}
