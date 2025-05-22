import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from "express";
import { TokensManager } from "../../managers/tokens.manager";
import { TokenExpiredException } from "../token-expired.exception";

@Catch(TokenExpiredException)
export class TokenExpiredExceptionListener extends BaseExceptionFilter {
  constructor(application: any, private tokens: TokensManager) {
    super(application);
  }
  public async catch(exception: HttpException, host: ArgumentsHost) {
    console.log("Token Expired Catch");
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    try {
      const user = await this.tokens.getUserFromToken(request.headers["authorization"]);
      const source = request.headers["x-source"] ? "mobile" : "web";
      console.log(source);
      const refreshToken = user.tokens.find(t => t.source === source);
      const refresh = await this.tokens.validate(refreshToken.token, source);
      return response.status(202).json({
        statusCode: 202,
        error: "Token extended",
        type: "TOKEN_EXTENDED",
        token: refresh.token
      });
    } catch (e) {
      return response.status(status).json({
        statusCode: status,
        error: "Token expired",
        type: "TOKEN_EXPIRED",
        isBrioError: true
      });
    }
  }
}
