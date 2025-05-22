"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTypeEnum = exports.ImportStatusEnum = exports.RoomEnum = void 0;
var RoomEnum;
(function (RoomEnum) {
    RoomEnum["ADMIN_ROOM"] = "admin-room";
})(RoomEnum = exports.RoomEnum || (exports.RoomEnum = {}));
var ImportStatusEnum;
(function (ImportStatusEnum) {
    ImportStatusEnum["PREPARING"] = "preparing";
    ImportStatusEnum["UPLOADED"] = "uploaded";
    ImportStatusEnum["VALIDATING"] = "validating";
    ImportStatusEnum["SAVING"] = "saving";
    ImportStatusEnum["COMPLETED"] = "completed";
})(ImportStatusEnum = exports.ImportStatusEnum || (exports.ImportStatusEnum = {}));
var FileTypeEnum;
(function (FileTypeEnum) {
    FileTypeEnum["SHAREHOLDER"] = "shareholder";
})(FileTypeEnum = exports.FileTypeEnum || (exports.FileTypeEnum = {}));
//# sourceMappingURL=websocket.interface.js.map