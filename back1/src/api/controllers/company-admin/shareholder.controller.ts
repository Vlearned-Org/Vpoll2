import { ShareholderVotingDto } from "@app/api/dtos/voting.dto";
import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { ImportBuildResult } from "@app/core/import-export/import-export.interface";
import { ShareholderFileImporter } from "@app/core/import-export/shareholder/shareholder.importer";
import { ProxyManager } from "@app/core/voting/proxy.manager";
import { VotingManager } from "@app/core/voting/voting.manager";
import { Shareholder, Voting } from "@app/data/model";
import { UserAuditData } from "@app/data/model/audit.model";
import { EventRepository, ProxyRepository, ShareholderRepository, VotingRepository,UserRepository } from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FileInterceptor } from "@nestjs/platform-express";
import { Context, ShareUtilization } from "@vpoll-shared/contract";
import { ImportFileEnum, RoleEnum, ShareholderTypeEnum, VoterTypeEnum } from "@vpoll-shared/enum";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";
import * as path from "path";
const stream = require("stream");
const Excel = require("exceljs");

@Controller("api/shareholders")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
export class ShareholderController {
  constructor(
    private moduleRef: ModuleRef,
    private shareholderRepo: ShareholderRepository,
    private auditRepo: AuditRepository,
    private proxyRepo: ProxyRepository,
    private votingRepo: VotingRepository,
    private eventRepo: EventRepository,
    private eventEmitter: EventEmitter2,
    private votingManager: VotingManager,
    private userRepo:UserRepository
  ) {}

  @Get()
  @Bind(ApiContext(), Query("eventId"))
  public async listEventShareholder(
    context: Context,
    eventId: string
  ): Promise<Array<Shareholder & { hasUserAccount: boolean; userStatus?: string }>> {
    // Fetch all shareholders for the given event
    const shareholders = await this.shareholderRepo.all(
      { eventId, companyId: context.companyId },
      { lean: true }
    );
  
    // Fetch users matching any shareholder's identityNumber
    const identityNumbers = shareholders.map((shareholder) => shareholder.identityNumber);
    const users = await this.userRepo.find({ nric: { $in: identityNumbers } });
  
    // Create a map of NRIC to user status for fast lookup
    const userStatusMap = new Map(users.map((user) => [user.nric, user.status]));
    console.log(userStatusMap);
    // Map each shareholder with 'hasUserAccount' and 'userStatus' properties
    return shareholders.map((shareholder) => ({

      ...shareholder,
      hasUserAccount: userStatusMap.has(shareholder.identityNumber),
      userStatus: userStatusMap.get(shareholder.identityNumber) || null, // Set to null if no user is matched
    }));
  }
  @Get("download-template")
  @Bind(Res())
  public async downloadShareholderImportTemplate(res) {
    const workbook = new Excel.Workbook();

    workbook.xlsx
      .readFile(path.join(__dirname, `../../../core/templates/imports/shareholder-import.xlsx`))
      .then(async () => {
        const readStream = new stream.PassThrough();
        await workbook.xlsx.write(readStream);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="download-${Date.now()}.xlsx"`);
        readStream.pipe(res);
      })
      .catch(err => {
        console.log(err);
        throw new Error("Failed To download");
      });
  }

  @Get(":id")
  @Bind(ApiContext(), Param("id"), Query("eventId"))
  public async getEventShareholderById(context: Context, shareholderId: string, eventId: string): Promise<Shareholder> {
    return this.shareholderRepo.get(shareholderId, {
      eventId,
      companyId: context.companyId
    });
  }

  @Post(":id/voting")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async createProxyVoting(context: Context, eventId: string, shareholderId: string, payload: ShareholderVotingDto): Promise<Voting> {
    const shareholder = await this.shareholderRepo.get(shareholderId, { companyId: context.companyId, eventId });
    return this.votingManager.voteAsShareholder(context.id, shareholder, payload.voting, payload.letterId);
  }

  @Post()
  @Bind(ApiContext(), Query("eventId"), Body())
  public async createEventShareholder(context: Context, eventId: string, shareholder: Shareholder): Promise<Shareholder> {
    shareholder.companyId = context.companyId;
    shareholder.eventId = eventId;
    const created = await this.shareholderRepo.create(shareholder);
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("added", {
          role: shareholder.shareholderType === ShareholderTypeEnum.SHAREHOLDER ? RoleEnum.SHAREHOLDER : RoleEnum.CHAIRMAN,
          ref: shareholder._id,
          name: shareholder.name
        })
      }
    ]);
    return created;
  }

  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  @Bind(ApiContext(), UploadedFile(), Query("eventId"))
  public async importEventShareholders(context: Context, file: any, eventId: string): Promise<ImportBuildResult<Shareholder>> {
    const shareholders = await this.shareholderRepo.all({ eventId });
    if (shareholders.length > 0) {
      throw new UserException({ message: "Please delete all shareholders before import" });
    }
    const importer = new ShareholderFileImporter(this.shareholderRepo, this.auditRepo, this.eventEmitter);
    return importer.import(
      {
        company: context.companyId,
        sender: context.id,
        type: ImportFileEnum.SHAREHOLDER,
        metadata: {
          eventId
        },
        fileBuffer: file.buffer
      },
      this.moduleRef
    );
  }

  @Patch(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"), Body())
  public async updateEventShareholder(context: Context, eventId: string, shareholderId: string, shareholder: Shareholder): Promise<Shareholder> {
    shareholder.companyId = context.companyId;
    shareholder.eventId = eventId;
    const updated = await this.shareholderRepo.update(shareholderId, shareholder, {
      eventId,
      companyId: context.companyId
    });
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("updated", {
          role: shareholder.shareholderType === ShareholderTypeEnum.SHAREHOLDER ? RoleEnum.SHAREHOLDER : RoleEnum.CHAIRMAN,
          ref: shareholder._id,
          name: shareholder.name
        })
      }
    ]);
    return updated;
  }

  @Delete()
  @Bind(ApiContext(), Query("eventId"))
  public async clearEventShareholders(context: Context, eventId: string): Promise<void> {
    await this.validateBeforeDeleteShareholder(eventId);
    const shareholders = await this.shareholderRepo.all({ eventId });
    await this.auditRepo.logUserCreation(
      shareholders.map(shareholder => {
        return {
          _id: undefined,
          eventId: eventId,
          userId: context.id,
          data: UserAuditData.create("deleted", {
            role: shareholder.shareholderType === ShareholderTypeEnum.SHAREHOLDER ? RoleEnum.SHAREHOLDER : RoleEnum.CHAIRMAN,
            ref: shareholder._id,
            name: shareholder.name
          })
        };
      })
    );
    return this.shareholderRepo.clear(context.companyId, eventId);
  }

  @Delete(":id")
  @Bind(ApiContext(), Query("eventId"), Param("id"))
  public async deleteShareholderById(context: Context, eventId: string, shareholderId: string): Promise<Shareholder> {
    await this.validateBeforeDeleteShareholder(eventId);
    const deleted = await this.shareholderRepo.delete(shareholderId, {
      _id: eventId,
      companyId: context.companyId
    });
    await this.auditRepo.logUserCreation([
      {
        _id: undefined,
        eventId: eventId,
        userId: context.id,
        data: UserAuditData.create("deleted", {
          role: deleted.shareholderType === ShareholderTypeEnum.SHAREHOLDER ? RoleEnum.SHAREHOLDER : RoleEnum.CHAIRMAN,
          ref: deleted._id,
          name: deleted.name
        })
      }
    ]);
    return deleted;
  }

  @Get(":id/share-utilization")
  @Bind(ApiContext(), Param("id"), Query("eventId"))
  public async getShareholderShareUtilization(context: Context, shareholderId: string, eventId: string): Promise<ShareUtilization> {
    const [shareholder, proxies] = await Promise.all([
      this.shareholderRepo.get(shareholderId, {
        eventId,
        companyId: context.companyId
      }),
      this.proxyRepo.getShareholderProxies(context.companyId, eventId, shareholderId)
    ]);

    return ProxyManager.shareUtilization(shareholder, proxies);
  }


  @Get(":id/voting")
  @Bind(ApiContext(), Param("id"), Query("eventId"))
  public async getShareholderVoting(context: Context, shareholderId: string, eventId: string): Promise<Voting> {
    return this.votingRepo.getOneBy("shareholderId", shareholderId, { eventId, voterType: VoterTypeEnum.SHAREHOLDER });
  }

  private async validateBeforeDeleteShareholder(eventId: string) {
    const event = await this.eventRepo.get(eventId);
    if (event.resolutions.length > 0) {
      throw new UserException({ message: "Cannot delete shareholder because resolution is created" });
    }
  }
}
