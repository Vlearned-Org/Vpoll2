import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "src/data/model/user.model";
import { AuthManager } from "../managers/auth.manager";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {}

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthManager) {
    super({ usernameField: "email" });
  }

  public async validate(email: string, password: string): Promise<User> {
    return this.auth.adminValidate(email, password);
  }
}
