import { Role, User } from "@app/data/model";
import { InviteeRepository, ProxyRepository, ShareholderRepository } from "@app/data/repositories";
import { Injectable } from "@nestjs/common";
import { AccountVerificationStatusEnum } from "@vpoll-shared/contract";
import { RoleEnum, ShareholderTypeEnum } from "@vpoll-shared/enum";

@Injectable()
export class RoleManager {
  constructor(private shareholderRepo: ShareholderRepository, private proxyRepo: ProxyRepository, private inviteeRepo: InviteeRepository) {}

  public async generateRoles(user: User): Promise<Array<Role>> {
    const invitees = await this.inviteeRepo.all({ mobile: user.mobile });
    const inviteeRoles: Array<Role> = invitees.map(_invitee => {
      return {
        role: RoleEnum.INVITEE,
        companyId: _invitee.companyId,
        eventId: _invitee.eventId,
        refId: _invitee._id
      };
    });
    if (user.accountVerificationStatus !== AccountVerificationStatusEnum.APPROVED) {
      return inviteeRoles;
    }

    const shareholders = await this.shareholderRepo.all({ identityNumber: user.nric });
    const shareholderRoles: Array<Role> = shareholders.map(_shareholder => {
      return {
        role: _shareholder.shareholderType === ShareholderTypeEnum.CHAIRMAN ? RoleEnum.CHAIRMAN : RoleEnum.SHAREHOLDER,
        companyId: _shareholder.companyId,
        eventId: _shareholder.eventId,
        refId: _shareholder._id
      };
    });

    const proxies = await this.proxyRepo.all({ identityNumber: user.nric });
    const proxyRoles: Array<Role> = proxies.map(_proxy => {
      return {
        role: RoleEnum.PROXY,
        companyId: _proxy.companyId,
        eventId: _proxy.eventId,
        refId: _proxy._id
      };
    });
    return [...shareholderRoles, ...proxyRoles, ...inviteeRoles];
  }
}
