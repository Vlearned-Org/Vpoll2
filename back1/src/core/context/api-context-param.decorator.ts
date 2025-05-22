import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Context, JwtToken } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";

export const ApiContext = createParamDecorator(async (input: unknown, ctx: ExecutionContext): Promise<Context> => {
  const request = ctx.switchToHttp().getRequest<Request & { user: JwtToken<any> }>();

  const context: Context = {
    id: request.user.id,
    name: request.user.name,
    isAdmin: request.user.isAdmin,
    companyId: null,
    role: null,
    roles: request.user.roles
  };

  if (request.user.isAdmin) {
    const companySystemRole = request.user.roles.find(r => r.role === RoleEnum.COMPANY_SYSTEM);
    if (companySystemRole) {
      context.companyId = companySystemRole.companyId as string;
      context.role = RoleEnum.COMPANY_SYSTEM;
      return context;
    }

    const companyAdminRole = request.user.roles.find(r => r.role === RoleEnum.COMPANY_ADMIN);
    if (companyAdminRole) {
      context.companyId = companyAdminRole.companyId as string;
      context.role = RoleEnum.COMPANY_ADMIN;
      return context;
    }

    context.role = RoleEnum.SYSTEM;
    return context;
  }

  return context;
});
