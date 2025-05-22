"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFormatsEnum = exports.MimeTypeEnum = void 0;
var MimeTypeEnum;
(function (MimeTypeEnum) {
    MimeTypeEnum["Jpeg"] = "image/jpeg";
    MimeTypeEnum["Jpg"] = "image/jpg";
    MimeTypeEnum["Png"] = "image/png";
    MimeTypeEnum["Gif"] = "image/gif";
    MimeTypeEnum["Pdf"] = "application/pdf";
    MimeTypeEnum["Csv"] = "text/csv";
    MimeTypeEnum["Doc"] = "application/msword";
    MimeTypeEnum["Docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    MimeTypeEnum["Ppt"] = "application/vnd.ms-powerpoint";
    MimeTypeEnum["Pptx"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    MimeTypeEnum["Xls"] = "application/vnd.ms-excel";
    MimeTypeEnum["Xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    MimeTypeEnum["Txt"] = "text/plain";
    MimeTypeEnum["Zip"] = "application/zip";
})(MimeTypeEnum = exports.MimeTypeEnum || (exports.MimeTypeEnum = {}));
var FileFormatsEnum;
(function (FileFormatsEnum) {
    FileFormatsEnum["csv"] = "csv";
    FileFormatsEnum["xls"] = "xls";
    FileFormatsEnum["xlsx"] = "xlsx";
    FileFormatsEnum["txt"] = "txt";
    FileFormatsEnum["pdf"] = "pdf";
    FileFormatsEnum["doc"] = "doc";
    FileFormatsEnum["docx"] = "docx";
    FileFormatsEnum["jpg"] = "jpg";
    FileFormatsEnum["jpeg"] = "jpeg";
    FileFormatsEnum["png"] = "png";
})(FileFormatsEnum = exports.FileFormatsEnum || (exports.FileFormatsEnum = {}));
//# sourceMappingURL=mime-types.enum.js.map