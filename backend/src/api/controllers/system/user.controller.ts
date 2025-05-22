import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";
import { Bind, Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum, UserStatusEnum } from "@vpoll-shared/enum";
import { UserRepository } from "src/data/repositories";

@Controller("api/users")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole(RoleEnum.SYSTEM)
export class UsersController {
  constructor(private userRepo: UserRepository, private notif: VpollNotifications) {}

  @Get()
  @Bind(ApiContext(), Query("status"))
  public async listUsers(context: Context, status: UserStatusEnum) {
    return this.userRepo.listNonAdminUsers(status);
  }

  @Get(":id")
  @Bind(ApiContext(), Param("id"))
  public async getUserById(context: Context, id: string) {
    return this.userRepo.get(id);
  }

  @Patch(":id/approve")
  @Bind(ApiContext(), Param("id"))
  public async activateUser(context: Context, id: string) {
    const result = await this.userRepo.approveUser(id);
    await this.notif.onUserApproved(result.email, {});
    return result;
  }

  @Patch(":id/reject")
  @Bind(ApiContext(), Param("id"), Body())
  public async deactivateUser(context: Context, id: string, payload: { reason: string }) {
    const result = await this.userRepo.rejectUser(id, payload.reason);
    await this.notif.onUserReject(result.email, { reason: result.rejectMessage });
    return result;
  }
}
