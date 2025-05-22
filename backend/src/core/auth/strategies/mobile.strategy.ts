import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "src/data/model/user.model";
import { AuthManager } from "../managers/auth.manager";

@Injectable()
export class MobileAuthGuard extends AuthGuard("mobile") {}

@Injectable()
export class MobileAuthStrategy extends PassportStrategy(Strategy, "mobile") {
  constructor(private auth: AuthManager) {
    super({ usernameField: "mobile" });
  }

  public async validate(mobile: string, password: string): Promise<User> {
    return this.auth.userValidate(mobile, password);
  }
}
