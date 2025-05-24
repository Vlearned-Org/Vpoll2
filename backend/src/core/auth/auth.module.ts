import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DataModule } from "src/data/data.module";
import { CoreModule } from "../core.module";
import { VpollNotifications } from "../notification/vpoll.notification";
import { JWT_KEY, JWT_TTL } from "./constant";
import { AuthManager } from "./managers/auth.manager";
import { EmailService } from "./managers/email.manager";
import { PasswordManager } from "./managers/password-manager";
import { RoleManager } from "./managers/role.manager";
import { TokensManager } from "./managers/tokens.manager";
import { JwtAuthStrategy } from "./strategies/jwt.strategy";
import { LocalAuthStrategy } from "./strategies/local.strategy";

const AUTH_STRATEGIES = [LocalAuthStrategy, JwtAuthStrategy];

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
  providers: [AuthManager, PasswordManager, TokensManager, RoleManager, EmailService, VpollNotifications, ...AUTH_STRATEGIES],
  exports: [AuthManager, PasswordManager, TokensManager, RoleManager]
})
export class AuthModule {}
