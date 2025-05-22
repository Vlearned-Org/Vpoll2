import { ModuleRef } from "@nestjs/core";
import { ImportFileEnum } from "@vpoll-shared/enum";

export type Errors = Array<{
  code?: string;
  col?: number;
  row?: number;
  data?: any;
}>;
export type Infos = Array<{ code?: string; row?: number }>;

export type ImportBuildResult<T> = {
  status: "error" | "success";
  data: {
    rows: Array<T>;
    columns?: Array<{ label: string; key: string }>;
    infos?: Infos;
  };
  errors: Errors;
};

export type ExportBuildResult<T> = {
  status: "error" | "success";
  data: {
    fileName: string;
    fileType: string;
    data: T;
  };
  errors: Errors;
};

// Import
export type StructuredData = any;
export interface ImportContext {
  company: string;
  sender?: string;
  type: ImportFileEnum;
  metadata: any;
  fileBuffer: Buffer;
}
export interface FileImporterInterface {
  import(context: ImportContext, moduleRef: ModuleRef): StructuredData;
}

// Aggregator
export type AggregatedData = any;

export interface AggregatorInterface {
  importAggregate(context: ImportContext): AggregatedData;
}
