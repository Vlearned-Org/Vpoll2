"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrioExceptionFilter = exports.LogicException = exports.DataException = exports.UserException = exports.ExternalTaskException = exports.BrokerException = exports.HttpClientException = exports.BrioException = void 0;
const common_1 = require("@nestjs/common");
const contract_1 = require("../contract");
const axios_1 = require("axios");
const stackTraceParser = require("stacktrace-parser");
const uuid_1 = require("uuid");
class BrioException extends Error {
    constructor(error = {}, code) {
        var _a, _b;
        super(error === null || error === void 0 ? void 0 : error.message);
        this.code = code;
        this.code = (_a = this.code) !== null && _a !== void 0 ? _a : code;
        this.message = (_b = this.message) !== null && _b !== void 0 ? _b : error.message;
        this.metadata = error === null || error === void 0 ? void 0 : error.metadata;
    }
}
exports.BrioException = BrioException;
class HttpClientException extends BrioException {
    constructor(error) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super(error, "HTTP");
        this.type = contract_1.BrioErrorType.HttpClient;
        this.status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        if (error.code === "EAI_AGAIN" || error.code === "ECONNREFUSED") {
            this.message = "Service not available";
            this.status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
        else {
            this.code = (_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.code) !== null && _c !== void 0 ? _c : "HTTP";
            this.metadata = (_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.metadata;
            this.message = (_h = (_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.message) !== null && _h !== void 0 ? _h : error.message;
            if ((_j = error.response) === null || _j === void 0 ? void 0 : _j.status) {
                this.status = (_k = error.response) === null || _k === void 0 ? void 0 : _k.status;
            }
        }
    }
}
exports.HttpClientException = HttpClientException;
class BrokerException extends BrioException {
    constructor(error = {}, code = "B") {
        super(error, code);
        this.code = code;
        this.type = contract_1.BrioErrorType.Broker;
        this.status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
exports.BrokerException = BrokerException;
class ExternalTaskException extends BrioException {
    constructor(error = {}, code = "ET") {
        super(error, code);
        this.code = code;
        this.type = contract_1.BrioErrorType.ExternalTask;
        this.status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
exports.ExternalTaskException = ExternalTaskException;
class UserException extends BrioException {
    constructor(error = {}, code = "U") {
        super(error, code);
        this.code = code;
        this.type = contract_1.BrioErrorType.User;
        this.status = common_1.HttpStatus.BAD_REQUEST;
    }
}
exports.UserException = UserException;
class DataException extends BrioException {
    constructor(error = {}, code = "D") {
        super(error, code);
        this.code = code;
        this.type = contract_1.BrioErrorType.Data;
        this.status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
exports.DataException = DataException;
class LogicException extends BrioException {
    constructor(error = {}, code = "L") {
        super(error, code);
        this.code = code;
        this.type = contract_1.BrioErrorType.Logic;
        this.status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
exports.LogicException = LogicException;
let BrioExceptionFilter = class BrioExceptionFilter {
    constructor(service, returnAsJSON = false) {
        this.service = service;
        this.returnAsJSON = returnAsJSON;
    }
    catch(exception, host = null) {
        var _a, _b, _c, _d, _e, _f;
        const ctx = host ? host.switchToHttp() : null;
        const response = ctx === null || ctx === void 0 ? void 0 : ctx.getResponse();
        const request = ctx === null || ctx === void 0 ? void 0 : ctx.getRequest();
        const status = (_a = exception.status) !== null && _a !== void 0 ? _a : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = exception.message;
        let type;
        let metadata = exception.metadata;
        let code;
        const stack = stackTraceParser
            .parse(exception.stack)
            .filter((stack) => stack.file &&
            stack.file.includes("src") &&
            !stack.file.includes("node_modules"));
        if (exception instanceof BrioException) {
            type = exception.type;
            code = exception.code;
        }
        else if (exception instanceof TypeError) {
            code = "T";
            type = contract_1.BrioErrorType.TypeScript;
        }
        else if (exception.name === "ValidationError") {
            code = "BV";
            message = "DB validation failed";
            metadata = exception.errors;
            type = contract_1.BrioErrorType.DBValidation;
        }
        else if (exception.name === "MongoError" ||
            exception.name === "CastError") {
            code = (_b = exception.code) === null || _b === void 0 ? void 0 : _b.toString();
            type = contract_1.BrioErrorType.Mongo;
        }
        else {
            code =
                ((_c = exception.response) === null || _c === void 0 ? void 0 : _c.error) && ((_d = exception.response) === null || _d === void 0 ? void 0 : _d.error) !== "Bad Request"
                    ? (_e = exception.response) === null || _e === void 0 ? void 0 : _e.error
                    : null;
            type = contract_1.BrioErrorType.Unhandled;
            metadata = (_f = exception.response) === null || _f === void 0 ? void 0 : _f.message;
        }
        const error = {
            code,
            status,
            service: this.service,
            path: request === null || request === void 0 ? void 0 : request.url,
            message,
            type,
            stack,
            metadata,
            id: (0, uuid_1.v1)(),
        };
        common_1.Logger.error(error);
        if (this.returnAsJSON) {
            return {
                status,
                error,
            };
        }
        if (!response) {
            axios_1.default.post("http://gateway:8001/v2/api/internal/non-http-errors", {
                status,
                error,
            });
            return;
        }
        response.status(status).json(error);
    }
};
BrioExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [String, Object])
], BrioExceptionFilter);
exports.BrioExceptionFilter = BrioExceptionFilter;
//# sourceMappingURL=global-exception.filter.js.map