import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtToken } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleConfig: {
      role: RoleEnum | RoleEnum[];
      comparisonOperator: "AND" | "OR";
    } = this.reflector.getAllAndOverride("roleConfig", [context.getClass(), context.getHandler()]);

    if (!roleConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtToken<any>;

    if (!Array.isArray(roleConfig.role)) {
      roleConfig.role = [roleConfig.role];
    }

    const requiredRoles = roleConfig.role as RoleEnum[];

    if (roleConfig.comparisonOperator === "OR") {
      return requiredRoles.some(requiredRole => {
        return user.roles.map(role => role.role).includes(requiredRole);
      });
    } else {
      return requiredRoles.every(requiredRole => {
        return user.roles.map(role => role.role).includes(requiredRole);
      });
    }
  }
}
