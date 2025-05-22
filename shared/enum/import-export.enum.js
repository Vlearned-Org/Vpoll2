"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportFileErrorCodes = exports.ImportFileEnum = exports.ImportExportFileWriterEnum = void 0;
var ImportExportFileWriterEnum;
(function (ImportExportFileWriterEnum) {
    ImportExportFileWriterEnum["CSV"] = "csv";
    ImportExportFileWriterEnum["XLS"] = "xls";
    ImportExportFileWriterEnum["XLSX"] = "xlsx";
})(ImportExportFileWriterEnum = exports.ImportExportFileWriterEnum || (exports.ImportExportFileWriterEnum = {}));
var ImportFileEnum;
(function (ImportFileEnum) {
    ImportFileEnum["SHAREHOLDER"] = "shareholder";
})(ImportFileEnum = exports.ImportFileEnum || (exports.ImportFileEnum = {}));
var ImportFileErrorCodes;
(function (ImportFileErrorCodes) {
    ImportFileErrorCodes["FILE_FORMAT_NOT_SUPPORTED"] = "GENERIC_FILE.FILE_FORMAT_NOT_SUPPORTED";
    ImportFileErrorCodes["FILE_IMPORT_ERROR"] = "GENERIC_FILE.FILE_IMPORT_ERROR";
    ImportFileErrorCodes["HEADER_FORMAT_INVALID"] = "GENERIC_FILE.HEADER_FORMAT_INVALID";
    ImportFileErrorCodes["DUPLICATE_UNIQUE_IDENTITY"] = "GENERIC_FILE.DUPLICATE_UNIQUE_IDENTITY";
    ImportFileErrorCodes["DATE_FORMAT_INVALID"] = "GENERIC_FILE.DATE_FORMAT_INVALID";
    ImportFileErrorCodes["NOT_APPLICABLE"] = "GENERIC_FILE.NOT_APPLICABLE";
    ImportFileErrorCodes["NOT_A_NUMBER"] = "GENERIC_FILE.NOT_A_NUMBER";
    ImportFileErrorCodes["SELECT_OPTION_INVALID"] = "GENERIC_FILE.SELECT_OPTION_INVALID";
    ImportFileErrorCodes["INVALID_EMAIL"] = "GENERIC_FILE.INVALID_EMAIL";
    ImportFileErrorCodes["CLASS_VALIDATION_FAIL"] = "GENERIC_FILE.CLASS_VALIDATION_FAIL";
    ImportFileErrorCodes["BROKER_ERROR"] = "GENERIC_FILE.BROKER_ERROR";
})(ImportFileErrorCodes = exports.ImportFileErrorCodes || (exports.ImportFileErrorCodes = {}));
//# sourceMappingURL=import-export.enum.js.map