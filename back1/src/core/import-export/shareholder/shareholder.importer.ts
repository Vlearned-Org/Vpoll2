import { ShareholderImportProgressEvent } from "@app/core/events/shareholder-import-progress.event";
import { UserAuditData } from "@app/data/model/audit.model";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Type } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ImportStatusEnum } from "@vpoll-shared/contract";
import { ImportFileErrorCodes, RoleEnum, ShareholderTypeEnum } from "@vpoll-shared/enum";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Shareholder } from "src/data/model";
import { ShareholderRepository } from "src/data/repositories";
import { AbstractFileImporter } from "../abstract.importer";
import { XlsReader } from "../file-format/reader/xls.reader";
import { FileImportExportUtility } from "../file-import-export.utils";
import { Errors } from "../import-export.interface";
import { DEFAULT_COLUMNS, StructuredShareholder } from "./shareholder.interface";

export class ShareholderFileImporter extends AbstractFileImporter<Shareholder, StructuredShareholder, any> {
  constructor(private shareholderRepo: ShareholderRepository, private auditRepo: AuditRepository, private eventEmitter: EventEmitter2) {
    super();
  }

  protected fileReader(fileBuffer: Buffer): any[] {
    const reader = new XlsReader();
    return reader.fromStream(fileBuffer);
  }

  protected get aggregatorClass(): Type<any> {
    return null;
  }

  protected generateColumns(): {
    label: string;
    key: string;
    required?: boolean;
  }[] {
    return DEFAULT_COLUMNS;
  }

  protected validateFileTemplate(): Errors {
    const errors: Errors = [];
    if (!this.data || !this.data.length) {
      errors.push({
        code: ImportFileErrorCodes.FILE_IMPORT_ERROR,
        data: { fileType: "Shareholder" }
      });
      return errors;
    }

    const [header1, header2, header3, ...shareholders] = this.data[0].data;
    if (
      header3.length !== this.columns.length ||
      !header3.every((value: string, index: number) => {
        return value.trim() === this.columns[index].label;
      })
    ) {
      errors.push({ code: ImportFileErrorCodes.HEADER_FORMAT_INVALID });
    }

    return errors;
  }

  protected buildStructuredData(): Array<StructuredShareholder> {
    const [header1, header2, header3, ...shareholders] = this.data[0].data;
    return FileImportExportUtility.buildExcelToStructuredJson(shareholders, this.columns);
  }

  protected transformToClass(structuredData: Array<StructuredShareholder>): Shareholder[] {
    return structuredData.map(data => {
      const shareholder: Shareholder = plainToClass(Shareholder, {
        companyId: this.context.company,
        eventId: this.context.metadata.eventId,
        name: data.shareholderName.trim().toUpperCase(),
        identityNumber: data.nric.startsWith("'") ? data.nric.substring(1).trim().replace(/-/g, "") : data.nric.trim().replace(/-/g, ""),
        cds: data.cdsNo.startsWith("'") ? data.cdsNo.substring(1).trim() : data.cdsNo.trim(),
        numberOfShares: parseInt(data.noOfShares.trim().replace(/,/g, "")),
        shareholderType: ShareholderTypeEnum.SHAREHOLDER,
        isLargeShareholder: false,
        nationality: data.nationality ? data.nationality.trim() : null,
        oldIC: data.oldNric ? data.oldNric.trim() : null,
        pc: data.pc ? data.pc.trim() : null,
        pbc: data.pbc ? data.pbc.trim() : null
      } as Shareholder);
      return shareholder;
    });
  }

  protected async validateClass(classData: Shareholder[]): Promise<Errors> {
    this.eventEmitter.emit(
      "shareholder.import-progress",
      new ShareholderImportProgressEvent(this.context.company, this.context.metadata.eventId, ImportStatusEnum.VALIDATING)
    );
    const errors: Errors = [];
    for (const [index, shldr] of classData.entries()) {
      const validation = await validate(shldr, {
        validationError: { value: false, target: false }
      });
      if (validation.length) {
        errors.push({
          code: ImportFileErrorCodes.CLASS_VALIDATION_FAIL,
          row: index + 1,
          data: validation
        });
      }
    }
    return errors;
  }
  protected async updateDatabase(classData: Shareholder[]) {
    const dbShareholders = await this.shareholderRepo.all({ companyId: this.context.company, eventId: this.context.metadata.eventId });

    const total = classData.length;
    let progress = 0;

    for (const shareholder of classData) {
      const dbShareholder = dbShareholders.find(
        dbShareholder => dbShareholder.cds === shareholder.cds && dbShareholder.identityNumber === shareholder.identityNumber
      );
      if (dbShareholder) {
        await this.shareholderRepo.update(dbShareholder._id, shareholder);
        progress += 1;

        if (progress % 100 === 0) {
          this.emitProgress(total, progress);
        }
      }
    }

    while (progress < total) {
      let next = progress + 500;
      if (next > total) {
        next = total;
      }
      const chunk = classData.slice(progress, next);
      const result = await this.shareholderRepo.bulk(chunk);
      await this.auditRepo.logUserCreation(
        chunk.map(shareholder => {
          return {
            _id: undefined,
            eventId: this.context.metadata.eventId,
            userId: this.context.sender,
            data: UserAuditData.create("added", {
              role: RoleEnum.SHAREHOLDER,
              ref: shareholder._id,
              name: shareholder.name
            })
          };
        })
      );
      progress = next;
      this.emitProgress(total, progress);
    }

    this.eventEmitter.emit(
      "shareholder.import-progress",
      new ShareholderImportProgressEvent(this.context.company, this.context.metadata.eventId, ImportStatusEnum.UPLOADED)
    );
  }

  private emitProgress(total, progress) {
    const progressPercentage = (progress / total) * 100;
    this.eventEmitter.emit(
      "shareholder.import-progress",
      new ShareholderImportProgressEvent(
        this.context.company,
        this.context.metadata.eventId,
        ImportStatusEnum.SAVING,
        parseFloat(progressPercentage.toFixed(2))
      )
    );
  }
}
