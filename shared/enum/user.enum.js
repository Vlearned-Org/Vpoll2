"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityTypeEnum = exports.UserStatusEnum = exports.UserTokenEnum = exports.AuthSourceEnum = exports.RoleEnum = void 0;
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["SYSTEM"] = "system";
    RoleEnum["COMPANY_SYSTEM"] = "company-system";
    RoleEnum["COMPANY_ADMIN"] = "company-admin";
    RoleEnum["CHAIRMAN"] = "chairman";
    RoleEnum["SHAREHOLDER"] = "shareholder";
    RoleEnum["PROXY"] = "proxy";
    RoleEnum["INVITEE"] = "invitee";
    RoleEnum["CORPORATE"] = "corporate";
})(RoleEnum = exports.RoleEnum || (exports.RoleEnum = {}));
var AuthSourceEnum;
(function (AuthSourceEnum) {
    AuthSourceEnum["web"] = "web";
    AuthSourceEnum["mobile"] = "mobile";
})(AuthSourceEnum = exports.AuthSourceEnum || (exports.AuthSourceEnum = {}));
var UserTokenEnum;
(function (UserTokenEnum) {
    UserTokenEnum["EMAIL"] = "email";
    UserTokenEnum["WEB"] = "web";
    UserTokenEnum["MOBILE"] = "mobile";
})(UserTokenEnum = exports.UserTokenEnum || (exports.UserTokenEnum = {}));
var UserStatusEnum;
(function (UserStatusEnum) {
    UserStatusEnum["PENDING"] = "PENDING";
    UserStatusEnum["ACTIVE"] = "ACTIVE";
    UserStatusEnum["INACTIVE"] = "INACTIVE";
})(UserStatusEnum = exports.UserStatusEnum || (exports.UserStatusEnum = {}));
var IdentityTypeEnum;
(function (IdentityTypeEnum) {
    IdentityTypeEnum["NRIC"] = "nric";
    IdentityTypeEnum["PASSPORT"] = "passport";
})(IdentityTypeEnum = exports.IdentityTypeEnum || (exports.IdentityTypeEnum = {}));
//# sourceMappingURL=user.enum.js.map