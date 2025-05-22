import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { FileHelper } from "src/core/storage/file.helper";
import { InternalFile } from "../model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class InternalFileRepository extends AbstractRepository<InternalFile> {
  constructor(
    @InjectModel(InternalFile)
    protected readonly model: ReturnModelType<typeof InternalFile>
  ) {
    super(model);
  }

  public async getFromUriToUuid(uri: string): Promise<InternalFile> {
    return this.getOneBy("uuid", FileHelper.removeExtension(uri));
  }
}
