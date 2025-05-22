import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AdminJwtToken, JwtToken, UserJwtToken } from "@vpoll-shared/contract";
import { UserTokenEnum } from "@vpoll-shared/enum";
import { User } from "src/data/model";
import { UserRepository } from "src/data/repositories";
import { v1 as uuid } from "uuid";
import { REFRESH_TOKEN_TTL, REFRESH_TOKEN_TTL_LONG_LIVED } from "../constant";
import moment = require("moment");

@Injectable()
export class TokensManager {
  constructor(private jwt: JwtService, private userRepo: UserRepository) {}

  public async generateJwt(user: User): Promise<string> {
    if (user.isAdmin) {
      const adminJwtToken: AdminJwtToken = {
        id: user._id.toString(),
        name: user.name,
        isAdmin: true,
        personalInfo: {
          email: user.email
        },
        status: user.status,
        roles: user.roles
      };
      return this.jwt.sign(adminJwtToken);
    } else {
      const userJwtToken: UserJwtToken = {
        id: user._id.toString(),
        name: user.name,
        isAdmin: false,
        personalInfo: {
          nric: user.nric,
          mobile: user.mobile,
          accountVerificationStatus: user.accountVerificationStatus,
          rejectMessage: user.rejectMessage
        },
        status: user.status,
        roles: user.roles
      };
      return this.jwt.sign(userJwtToken);
    }
  }

  public async generateRefreshToken(userId: string, longLived = false, source: UserTokenEnum = UserTokenEnum.WEB): Promise<string> {
    const refreshToken = uuid();
    const refreshTokenExpiresAt = moment()
      .add(longLived ? REFRESH_TOKEN_TTL_LONG_LIVED : REFRESH_TOKEN_TTL, "seconds")
      .toDate();

    const user = await this.userRepo.setToken(source, {
      userId,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt
    });

    const sourceToken = user.tokens.find(t => t.source === source);
    if (!sourceToken) {
      throw new Error("Token not found");
    }
    return sourceToken?.token;
  }

  public async validate(token: string, source: string = UserTokenEnum.WEB): Promise<{ user: User; token: string; validatedToken: string }> {
    if (!token) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepo.findOneByToken(source, token);

    if (!user || !user.tokens || user.tokens.length <= 0) {
      throw new UnauthorizedException();
    }

    const sourceToken = user.tokens.find(t => t.source === source);
    if (!sourceToken) {
      throw new Error("Token not found");
    }

    if (sourceToken?.expiresAt < moment().toDate()) {
      throw new UnauthorizedException();
    }

    const [jwt, userUpdated] = await Promise.all([this.generateJwt(user), this.userRepo.setLoginAt(user._id)]);

    return { user, token: jwt, validatedToken: sourceToken?.token };
  }

  public async getUserFromToken(authorization: string): Promise<User> {
    const payload = this.jwt.decode(authorization.split(" ")[1]) as JwtToken<any>;
    return this.userRepo.get(payload.id);
  }

  public async verifyJwtWithoutBearer(jwtToken: string): Promise<User> {
    const payload = (await this.jwt.verifyAsync(jwtToken)) as JwtToken<any>;
    return this.userRepo.get(payload.id);
  }
}
