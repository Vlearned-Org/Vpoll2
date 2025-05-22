import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { AdminJwtToken, UserJwtToken } from "@vpoll-shared/contract";

import { ExtractJwt, Strategy } from "passport-jwt";
import { JWT_KEY } from "../constant";
import { TokenExpiredException } from "../exceptions/token-expired.exception";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: false,
      ignoreExpiration: true,
      secretOrKey: JWT_KEY
    });
  }

  public async validate(payload: any) {
    if (this.isTokenExpired(payload.exp)) {
      console.log("Token Expired");
      throw new TokenExpiredException("Token expired", 401);
    }

    if (payload.isAdmin) {
      return {
        id: payload.id.toString(),
        isAdmin: payload.isAdmin,
        name: payload.name,
        personalInfo: {
          email: payload.email
        },
        status: payload.status,
        roles: payload.roles
      } as AdminJwtToken;
    } else {
      return {
        id: payload.id.toString(),
        isAdmin: payload.isAdmin,
        name: payload.name,
        personalInfo: {
          nric: payload.nric,
          mobile: payload.mobile,
          accountVerificationStatus: payload.accountVerificationStatus,
          rejectMessage: payload.rejectMessage
        },
        status: payload.status,
        roles: payload.roles
      } as UserJwtToken;
    }
  }

  private isTokenExpired(exp: number) {
    return Date.now() >= exp * 1000;
  }
}
