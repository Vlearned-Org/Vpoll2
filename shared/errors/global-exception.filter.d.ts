import { ArgumentsHost, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { BrioError, BrioErrorType, InternalError } from "@vpoll-shared/contract";
import { AxiosError } from "axios";
export declare abstract class BrioException<T = null> extends Error {
    code: string;
    abstract type: BrioErrorType;
    abstract status: number;
    message: string;
    metadata: T | undefined;
    constructor(error: InternalError<T>, code: string);
}
export declare class HttpClientException<T = null> extends BrioException<T> {
    type: BrioErrorType;
    status: HttpStatus;
    constructor(error: AxiosError<any>);
}
export declare class BrokerException<T = null> extends BrioException<T> {
    code: string;
    type: BrioErrorType;
    status: HttpStatus;
    constructor(error?: InternalError<T>, code?: string);
}
export declare class ExternalTaskException<T = null> extends BrioException<T> {
    code: string;
    type: BrioErrorType;
    status: HttpStatus;
    constructor(error?: InternalError<T>, code?: string);
}
export declare class UserException<T = null> extends BrioException<T> {
    code: string;
    type: BrioErrorType;
    status: HttpStatus;
    constructor(error?: InternalError<T>, code?: string);
}
export declare class DataException<T = null> extends BrioException<T> {
    code: string;
    type: BrioErrorType;
    status: HttpStatus;
    constructor(error?: InternalError<T>, code?: string);
}
export declare class LogicException<T = null> extends BrioException<T> {
    code: string;
    type: BrioErrorType;
    status: HttpStatus;
    constructor(error?: InternalError<T>, code?: string);
}
export declare class BrioExceptionFilter implements ExceptionFilter {
    private service;
    private returnAsJSON;
    constructor(service: string, returnAsJSON?: boolean);
    catch(exception: any, host?: ArgumentsHost): {
        status: any;
        error: BrioError;
    };
}
