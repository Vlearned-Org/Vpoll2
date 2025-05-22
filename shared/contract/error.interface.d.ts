export declare enum BrioErrorType {
    User = "user",
    Data = "data",
    Logic = "logic",
    HttpClient = "http-client",
    Broker = "broker",
    ExternalTask = "external-task",
    TypeScript = "typescript",
    DBValidation = "db-validation",
    Mongo = "mongo",
    Unhandled = "unhandled"
}
export interface InternalError<T> {
    message?: string;
    metadata?: T;
}
export interface ErrorStackTrace {
    file: string | null;
    methodName: string;
    arguments: string[];
    lineNumber: number | null;
    column: number | null;
}
export interface BrioError {
    id: string;
    code: string;
    status: number;
    service: string;
    path: string;
    message?: string;
    type: BrioErrorType;
    metadata?: unknown;
    stack: Array<ErrorStackTrace>;
}
