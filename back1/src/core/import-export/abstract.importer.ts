import { Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Socket } from "socket.io";
import { AbstractAggregator } from "./abstract.aggregator";
import { AggregatedData, Errors, FileImporterInterface, ImportBuildResult, ImportContext } from "./import-export.interface";
export abstract class AbstractFileImporter<ClassData, StructuredData, AggregatedDataType extends AggregatedData> implements FileImporterInterface {
  public context: ImportContext;
  public data: Array<any>;
  public columns: Array<{ label: string; key: string; required?: boolean }> = [];
  protected aggregatedData: AggregatedDataType = null;

  protected abstract get aggregatorClass(): Type<AbstractAggregator>;

  // Extract File
  protected abstract fileReader(fileBuffer: Buffer): Array<any>;
  // Build and Validate Excel Template
  protected abstract generateColumns(): Array<{ label: string; key: string; required?: boolean }>;
  protected abstract validateFileTemplate(): Errors;
  // Build and Validate Structured Data
  protected abstract buildStructuredData(): Array<StructuredData>;
  //   protected abstract validateFileData(structuredData: Array<StructuredData>): Promise<{ infos: Infos; errors: Errors }>;
  // Build and Validate Class Data to be updated into DB
  protected abstract transformToClass(structuredData: Array<StructuredData>): Array<ClassData>;
  protected abstract validateClass(classData: Array<ClassData>): Promise<Errors>;
  protected abstract updateDatabase(classData: Array<ClassData>, socketClient?: Socket);

  public async import(context: ImportContext, moduleRef: ModuleRef): Promise<ImportBuildResult<ClassData>> {
    this.context = context;

    // Extract File
    this.data = this.fileReader(context.fileBuffer);

    // Aggregate neccessary data to perform validation
    if (this.aggregatorClass) {
      const aggregator: AbstractAggregator = await moduleRef.resolve(this.aggregatorClass);
      this.aggregatedData = await aggregator.importAggregate(context);
    }

    // Generate Column
    this.columns = this.generateColumns();

    // Validate Template
    const templateErrors = this.validateFileTemplate();
    if (templateErrors?.length > 0) {
      return {
        status: "error",
        data: {
          columns: [],
          rows: []
        },
        errors: templateErrors
      };
    }

    // If template is good, convert to structured data and perform data validation
    const structuredData = this.buildStructuredData();

    // Transform Model
    const classData = await this.transformToClass(structuredData);
    const classValidationErrors = await this.validateClass(classData);

    if (classValidationErrors.length > 0) {
      return {
        status: "error",
        data: {
          columns: this.columns,
          rows: this.data
        },
        errors: classValidationErrors
      };
    }

    try {
      this.updateDatabase(classData.filter(data => data));
      return {
        status: "success",
        data: {
          columns: this.columns,
          rows: []
        },
        errors: []
      };
    } catch (e) {
      return {
        status: "error",
        data: {
          columns: this.columns,
          rows: classData
        },
        errors: [
          {
            data: e
          }
        ]
      };
    }
  }
}
