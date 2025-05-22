import { Bind, Controller, Get, Param, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";
import { FileBuffer } from "@vpoll-shared/type/file-buffer.type";
import { Response } from "express";
import { JwtAuthGuard } from "src/core/auth/strategies/jwt.strategy";
import { ApiContext } from "src/core/context/api-context-param.decorator";
import { StorageManager } from "src/core/storage/storage.manager";
import { InternalFile } from "src/data/model";

@Controller("api/storage")
export class StorageController {
  constructor(private storageManager: StorageManager) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @Bind(ApiContext(), UploadedFile())
  public async uploadFile(context: Context, file: FileBuffer): Promise<InternalFile> {
    console.log("Upload Filesss");
    console.log(context);
    return this.storageManager.upload(context.id, file, context.companyId);
  }

  @Get("file-public-url/:fileId")
  @UseGuards(JwtAuthGuard)
  @Bind(ApiContext(), Param("fileId"))
  public async getPublicUrl(context: Context, fileId: string): Promise<{ partialUrl: string }> {
    if (context.role === RoleEnum.SYSTEM) {
      return { partialUrl: fileId };
    }
    if ([RoleEnum.COMPANY_ADMIN, RoleEnum.COMPANY_SYSTEM].includes(context.role)) {
      return { partialUrl: await this.storageManager.getPublicUrl(fileId, { company: context.companyId }) };
    } else {
      return { partialUrl: await this.storageManager.getOwnFileUrl(fileId, context.id) };
    }
  }

  @Get("serve/:fileId")
  @Bind(Param("fileId"), Query("companyId"), Query("userId"), Res())
  public async serveFile(fileId: string, companyId: string, userId: string, res: Response): Promise<void> {
    const filters = {
      ...(companyId ? { company: companyId } : {}),
      ...(userId ? { user: userId } : {})
    };
    await this.storageManager.serve(fileId, filters, res);
  }
}
