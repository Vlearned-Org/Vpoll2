import { HttpException } from "@nestjs/common";

export class TokenExpiredException extends HttpException {}
