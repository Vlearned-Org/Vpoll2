import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  BrioError,
  BrioErrorType,
  InternalError,
} from "@vpoll-shared/contract";
import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import * as stackTraceParser from "stacktrace-parser";
import { v1 as uuid } from "uuid";

export abstract class BrioException<T = null> extends Error {
  public abstract type: BrioErrorType;
  public abstract status: number;
  public message: string;
  public metadata: T | undefined;

  constructor(error: InternalError<T> = {}, public code: string) {
    // FIXME: we should get this.message?
    super(error?.message);
    this.code = this.code ?? code;
    this.message = this.message ?? error.message;
    this.metadata = error?.metadata;
  }
}

export class HttpClientException<T = null> extends BrioException<T> {
  public type = BrioErrorType.HttpClient;
  public status = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(error: AxiosError<any>) {
    super(error, "HTTP");
    if (error.code === "EAI_AGAIN" || error.code === "ECONNREFUSED") {
      this.message = "Service not available";
      this.status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      this.code = error.response?.data?.code ?? "HTTP";
      this.metadata = error.response?.data?.metadata;
      this.message = error.response?.data?.message ?? error.message;
      if (error.response?.status) {
        this.status = error.response?.status;
      }
    }
  }
}

export class BrokerException<T = null> extends BrioException<T> {
  public type = BrioErrorType.Broker;
  public status = HttpStatus.INTERNAL_SERVER_ERROR;
  constructor(error: InternalError<T> = {}, public code: string = "B") {
    super(error, code);
  }
}

export class ExternalTaskException<T = null> extends BrioException<T> {
  public type = BrioErrorType.ExternalTask;
  public status = HttpStatus.INTERNAL_SERVER_ERROR;
  constructor(error: InternalError<T> = {}, public code: string = "ET") {
    super(error, code);
  }
}

export class UserException<T = null> extends BrioException<T> {
  public type = BrioErrorType.User;
  public status = HttpStatus.BAD_REQUEST;
  constructor(error: InternalError<T> = {}, public code: string = "U") {
    super(error, code);
  }
}

export class DataException<T = null> extends BrioException<T> {
  public type = BrioErrorType.Data;
  public status = HttpStatus.INTERNAL_SERVER_ERROR;
  constructor(error: InternalError<T> = {}, public code: string = "D") {
    super(error, code);
  }
}

export class LogicException<T = null> extends BrioException<T> {
  public type = BrioErrorType.Logic;
  public status = HttpStatus.INTERNAL_SERVER_ERROR;
  constructor(error: InternalError<T> = {}, public code: string = "L") {
    super(error, code);
  }
}

// FIXME: finalize interfaces / types
@Catch()
export class BrioExceptionFilter implements ExceptionFilter {
  constructor(private service: string, private returnAsJSON = false) {}

  // FIXME add proper exception type
  public catch(exception: any, host: ArgumentsHost = null) {
    const ctx = host ? host.switchToHttp() : null;
    const response = ctx?.getResponse<Response>();
    const request = ctx?.getRequest<Request>();
    const status = exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;
    let type: BrioErrorType;
    let metadata: unknown = exception.metadata;
    let code: string;
    const stack = stackTraceParser
      .parse(exception.stack)
      .filter(
        (stack) =>
          stack.file &&
          stack.file.includes("src") &&
          !stack.file.includes("node_modules")
      );

    if (exception instanceof BrioException) {
      type = exception.type;
      code = exception.code;
    } else if (exception instanceof TypeError) {
      code = "T";
      type = BrioErrorType.TypeScript;
    } else if (exception.name === "ValidationError") {
      code = "BV";
      message = "DB validation failed";
      metadata = (exception as any).errors;
      type = BrioErrorType.DBValidation;
    } else if (
      exception.name === "MongoError" ||
      exception.name === "CastError"
    ) {
      code = exception.code?.toString();
      type = BrioErrorType.Mongo;
    } else {
      code =
        exception.response?.error && exception.response?.error !== "Bad Request"
          ? exception.response?.error
          : null;
      type = BrioErrorType.Unhandled;
      metadata = exception.response?.message;
    }

    const error: BrioError = {
      code,
      status,
      service: this.service,
      path: request?.url,
      message,
      type,
      stack,
      metadata,
      id: uuid(),
    };

    Logger.error(error);

    if (this.returnAsJSON) {
      return {
        status,
        error,
      };
    }

    if (!response) {
      // This is to handle out of http context errors (broker, external tasks)
      axios.post("http://gateway:8001/v2/api/internal/non-http-errors", {
        status,
        error,
      });
      return;
    }

    response.status(status).json(error);
  }
}
