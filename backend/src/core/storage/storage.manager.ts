import { FileMetadata, InternalFile } from "@app/data/model";
import { InternalFileRepository } from "@app/data/repositories";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MimeTypeEnum } from "@vpoll-shared/enum/mime-types.enum";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";
import { Response } from "express";
import * as fs from "fs";
import { Stream } from "stream";
const contentDisposition = require("content-disposition");

class FileFormatException extends UserException<{ mimeType: string }> {
  public status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
  public code = "FILEFORMAT";
  public message = "File format not supported";
}

@Injectable()
export class StorageManager {
  constructor(private config: ConfigService, private fileRepo: InternalFileRepository) {}

  public async getPublicUrl(fileId: string, filters: any): Promise<string> {
    const file = await this.fileRepo.get(fileId, filters);
    if (!file) {
      throw new NotFoundException();
    }
    return `${file._id}?companyId=${file.company}`;
  }

  public async getOwnFileUrl(fileId: string, uid: string): Promise<string> {
    const file = await this.fileRepo.get(fileId, { user: uid });
    if (!file) {
      throw new NotFoundException();
    }
    return `${file._id}?userId=${file.user}`;
  }

  public async serve(fileId: string, filters: any, res: Response): Promise<void> {
    const file = await this.fileRepo.get(fileId, filters);
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found in the database.`);
    }
  
    const filePath = `${this.config.get("STORAGE_LOCAL_DIR")}/${file.uri}`;
  
    if (!this.exists(file.uri)) {
      console.error(`File not found: ${filePath}`);
      throw new NotFoundException(`File with ID ${fileId} is missing from the server.`);
    }
  
    res.set({
      "Content-Type": file.metadata.contentType,
      "Content-Disposition": contentDisposition(file.metadata.originalName, { type: "inline" }),
      "Content-Length": file.size,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: 0,
    });
  
    const stream = this.getStream(file.uri) as Stream;
    stream.pipe(res).on("error", (err) => {
      console.error(`Error streaming file: ${filePath}`, err);
      res.status(500).json({ error: "Error serving the file." });
    });
  }

  public async upload(userId: string, uploadedFile: Express.Multer.File, company?: string) {
    const mimeType = uploadedFile.mimetype;
    if (!Object.values(MimeTypeEnum).includes(mimeType as MimeTypeEnum)) {
      throw new FileFormatException({
        metadata: {
          mimeType: uploadedFile.mimetype
        }
      });
    }

    const file = await this.fileRepo.create({
      size: uploadedFile.size,
      company,
      user: userId,
      metadata: {
        originalName: uploadedFile.originalname,
        contentType: uploadedFile.mimetype
      } as FileMetadata
    } as InternalFile);

    let fileBuffer = uploadedFile.buffer;

    const created = this.createFromBuffer([file.uuid, file.extension].join("."), fileBuffer);
    if (!created) {
      throw new Error(`File upload fail.`);
    }

    return this.fileRepo.update(file._id, {
      size: fileBuffer.length
    } as InternalFile);
  }

  private createFromBuffer(path: string, buffer: Buffer): boolean {
    fs.writeFileSync(`${this.config.get("STORAGE_LOCAL_DIR")}/${path}`, buffer);
    return this.exists(path);
  }

  private getStream(path: string): Stream | boolean {
    return fs.createReadStream(`${this.config.get("STORAGE_LOCAL_DIR")}/${path}`, { autoClose: true });
  }

  private exists(path: string): boolean {
    return fs.existsSync(`${this.config.get("STORAGE_LOCAL_DIR")}/${path}`);
  }
}
