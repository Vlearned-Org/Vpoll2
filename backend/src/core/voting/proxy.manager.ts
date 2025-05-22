import { Proxy, Shareholder } from "@app/data/model";
import { EventRepository, ProxyRepository, ShareholderRepository } from "@app/data/repositories";
import { Injectable } from "@nestjs/common";
import { ShareUtilization } from "@vpoll-shared/contract";
import { LogicException, UserException } from "@vpoll-shared/errors/global-exception.filter";
import { ISODateTime } from "@vpoll-shared/type/date.type";
import * as moment from "moment";

// 1 user/chairman can have multi proxy for the same event
// 1 shareholder can have 1 unique proxy for 1 event
@Injectable()
export class ProxyManager {
  public static shareUtilization(shareholder: Shareholder, proxies: Array<Proxy>): ShareUtilization {
    const totalShares = shareholder.numberOfShares;
    const utilizedShares = proxies.reduce((acc, proxy) => acc + proxy.allocatedShares, 0);
    const remainderShares = totalShares - utilizedShares;
    return {
      totalShares,
      utilizedShares,
      remainderShares,
      allocatedShares: proxies.map(proxy => ({ shares: proxy.allocatedShares, proxyId: proxy._id }))
    };
  }

  constructor(private eventRepo: EventRepository, private proxyRepo: ProxyRepository, private shareholderRepo: ShareholderRepository) {}

  public async addProxy(companyId: string, eventId: string, proxy: Proxy) {
    const [event, shareholder, shareholderProxies] = await Promise.all([
      this.eventRepo.get(eventId, { companyId }),
      this.shareholderRepo.get(proxy.shareholderId as string, { companyId, eventId }),
      this.proxyRepo.getShareholderProxies(companyId, eventId, proxy.shareholderId as string)
    ]);

    this.validatePassProxyCutOffTime(event.setting.proxyRegstrCutOffTime);
    this.validateProxyExisted(shareholderProxies, proxy.identityNumber);
    const { remainderShares } = ProxyManager.shareUtilization(shareholder, shareholderProxies);
    this.validateSufficientShares(remainderShares, proxy.allocatedShares);

    const proxyCreated = await this.proxyRepo.create(proxy);
    return proxyCreated;

    // Voting

    // Event emit: to create user
    // Create event audit: who has created proxy for shareholder
  }

  public async updateProxy(companyId: string, eventId: string, proxy: Proxy) {
    const [event, shareholder, shareholderProxies] = await Promise.all([
      this.eventRepo.get(eventId, { companyId }),
      this.shareholderRepo.get(proxy.shareholderId as string, { companyId, eventId }),
      this.proxyRepo.getShareholderProxies(companyId, eventId, proxy.shareholderId as string)
    ]);

    this.validatePassProxyCutOffTime(event.setting.proxyRegstrCutOffTime);
    //this.validateProxyNotExisted(shareholderProxies, proxy.identityNumber);

    let toBeUpdatedProxy: Proxy,
      otherProxies: Array<Proxy> = [];
    for (const shareholderProxy of shareholderProxies) {
      console.log(typeof shareholderProxy._id, shareholderProxy._id);
      console.log(typeof proxy._id, proxy._id);
      if (shareholderProxy._id.toString() === proxy._id.toString()) {
        toBeUpdatedProxy = shareholderProxy;
      } else {
        otherProxies.push(shareholderProxy);
      }
    }

    const { remainderShares } = ProxyManager.shareUtilization(shareholder, otherProxies);
    this.validateSufficientShares(remainderShares, proxy.allocatedShares);

    const updatedProxy = await this.proxyRepo.update(proxy._id, proxy);
    return updatedProxy;
  }

  public async deleteProxy(companyId: string, eventId: string, proxyId: string): Promise<Proxy> {
    return this.proxyRepo.deleteProxy(companyId, eventId, proxyId);
  }

  private validateSufficientShares(remainderShares: number, sharesToAllocate: number) {
    if (sharesToAllocate > remainderShares) {
      throw new UserException({ message: "Shareholder do not have enough shares for proxy" });
    }
  }

  private validatePassProxyCutOffTime(proxyRegstrCutOffTime: ISODateTime) {
    if (moment().isAfter(moment(proxyRegstrCutOffTime).endOf("day"))) {
      throw new UserException({ message: "proxy registration cutoff time is crossed" });
    }
  }

  private validateProxyExisted(shareholderProxies: Array<Proxy>, proxyIdentityNumber: string) {
    if (this.isProxyExisted(shareholderProxies, proxyIdentityNumber)) {
      throw new UserException({ message: "Proxy with identityNumber for shareholder nric and cds is already present" });
    }
  }

  private validateProxyNotExisted(shareholderProxies: Array<Proxy>, proxyIdentityNumber: string) {
    if (!this.isProxyExisted(shareholderProxies, proxyIdentityNumber)) {
      throw new LogicException({ message: "Proxy with identityNumber for shareholder nric not found" });
    }
  }

  private isProxyExisted(shareholderProxies: Array<Proxy>, proxyIdentityNumber: string): boolean {
    return !!shareholderProxies.find(_proxy => _proxy.identityNumber === proxyIdentityNumber);
  }
}
