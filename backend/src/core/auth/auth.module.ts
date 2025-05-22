import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DataModule } from "src/data/data.module";
import { CoreModule } from "../core.module";
import { JWT_KEY, JWT_TTL } from "./constant";
import { AuthManager } from "./managers/auth.manager";
import { PasswordManager } from "./managers/password-manager";
import { RoleManager } from "./managers/role.manager";
import SmsService from "./managers/sms.manager";
import { TokensManager } from "./managers/tokens.manager";
import { JwtAuthStrategy } from "./strategies/jwt.strategy";
import { LocalAuthStrategy } from "./strategies/local.strategy";
import { MobileAuthStrategy } from "./strategies/mobile.strategy";

const AUTH_STRATEGIES = [LocalAuthStrategy, MobileAuthStrategy, JwtAuthStrategy];

@Module({
  imports: [
    HttpModule,
    DataModule,
    forwardRef(() => CoreModule),
    PassportModule,
    JwtModule.register({
      secret: JWT_KEY,
      signOptions: { expiresIn: Number(JWT_TTL) }
    })
  ],
  providers: [AuthManager, PasswordManager, TokensManager, RoleManager, SmsService, ...AUTH_STRATEGIES],
  exports: [AuthManager, PasswordManager, TokensManager, RoleManager]
})
export class AuthModule {}
