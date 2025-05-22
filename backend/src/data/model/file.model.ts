import { pre, prop, Ref } from "@typegoose/typegoose";
import { FileMetadata as FileMetadataContract, RichInternalFile as RichInternalFileContract } from "@vpoll-shared/contract/filesystem.interface";
import { IsOptional } from "class-validator";
import { FileHelper } from "src/core/storage/file.helper";
import { v1 as uuid } from "uuid";
import { AbstractModel } from "./abstract.model";
import { Company } from "./company.model";
import { User } from "./user.model";
const slugify = require("slugify");

export class FileMetadata implements FileMetadataContract {
  @prop({ required: true })
  public originalName: string;

  @prop({ required: true })
  public contentType: string; // MimeTypeEnum
}

@pre<InternalFile>("validate", function () {
  if (this.isNew) {
    this.uuid = uuid();
    this.name = slugify(this.metadata.originalName);
    this.extension = FileHelper.getExtension(this.metadata.originalName);
  }
})
export class InternalFile extends AbstractModel implements RichInternalFileContract {
  @IsOptional()
  @prop({ required: true })
  public name: string;

  @prop({ ref: "Company" })
  public company?: Ref<Company>;

  @prop({ required: true, ref: "User", index: true })
  public user: Ref<User>;

  @IsOptional()
  @prop({ required: true, index: true })
  public uuid: string;

  @IsOptional()
  @prop({ required: true })
  public extension: string;

  @IsOptional()
  @prop({ required: true })
  public size: number;

  @prop({ type: FileMetadata, _id: false })
  public metadata: FileMetadata;

  public get uri() {
    return [this.uuid, this.extension].join(".");
  }
}
