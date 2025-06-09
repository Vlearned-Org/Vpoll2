import { Proxy, ResolutionVotingEntry, Shareholder, Voting,Corporate } from "@app/data/model";
import { VoteAuditData } from "@app/data/model/audit.model";
import { EventRepository, ShareholderRepository, VotingRepository } from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Injectable } from "@nestjs/common";
import { VoterTypeEnum } from "@vpoll-shared/enum";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";

@Injectable()
export class VotingManager {
  constructor(
    private votingRepo: VotingRepository,
    private auditRepo: AuditRepository,
    private shareholderRepo: ShareholderRepository,
    private eventRepo: EventRepository
  ) {}

  public async voteAsProxy(executorId: string, proxy: Proxy, votingResult: Array<ResolutionVotingEntry>, isSecondProxy: boolean) {
    const event = await this.eventRepo.get(proxy.eventId as string);
    if (event.polling.endAt) {
      throw new UserException({ message: "Polling ended" });
    }
    const votingExisted = await this.votingRepo.getOneBy("cds", proxy.cds, { 
      eventId: proxy.eventId,
      voterType: { $in: [VoterTypeEnum.PROXY, VoterTypeEnum.CHAIRMAN] },
      companyId: proxy.companyId
    });
    // TODO: How to discriminate second voting?
    const vote: Voting = {
      companyId: proxy.companyId,
      eventId: proxy.eventId,
      shareholderId: proxy.shareholderId,
      cds: proxy.cds,
      proxyId: proxy._id,
      voterType: proxy.isChairmanAsProxy ? VoterTypeEnum.CHAIRMAN : VoterTypeEnum.PROXY,
      isPreVote: proxy.voteSetting.isPreVote,
      result: votingResult,
      executorId
    } as Voting;

    const voting = votingExisted
      ? await this.votingRepo.update(votingExisted._id, Object.assign(votingExisted, vote))
      : await this.votingRepo.create(vote);
    await Promise.all(
      votingResult.map(voting =>
        this.auditRepo.logVoting({
          _id: undefined,
          eventId: proxy.eventId as string,
          userId: executorId,
          data: VoteAuditData.create(votingExisted ? "updated" : "added", {
            voterName: proxy.name,
            voterId: proxy._id,
            votingResult: voting.response,
            shareholderId: (proxy.shareholderId as Shareholder)._id,
            shareholderName: (proxy.shareholderId as Shareholder).name,
            resolutionId: voting.resolutionId as string,
            resolutionTitle: event.resolutions.find(reso => reso._id.toString() === voting.resolutionId).title
          })
        })
      )
    );

    return voting;
  }



  public async voteAsShareholder(
    executorId: string,
    shareholder: Shareholder,
    votingResult: Array<ResolutionVotingEntry>,
    voteOnBehalfLetter?: string
  ) {
    const event = await this.eventRepo.get(shareholder.eventId as string);
    if (event.polling.endAt) {
      throw new UserException({ message: "Polling ended" });
    }
    const votingExisted = await this.votingRepo.getOneBy("cds", shareholder.cds, {
      eventId: shareholder.eventId,
      voterType: VoterTypeEnum.SHAREHOLDER,
      companyId: shareholder.companyId
    });
    const vote: Voting = {
      companyId: shareholder.companyId,
      eventId: shareholder.eventId,
      shareholderId: shareholder._id.toString(),
      cds: shareholder.cds,
      proxyId: undefined,
      voterType: VoterTypeEnum.SHAREHOLDER,
      isPreVote: false,
      result: votingResult,
      voteOnBehalfLetter: voteOnBehalfLetter as any,
      executorId
    } as Voting;
    const voting = votingExisted
      ? await this.votingRepo.update(votingExisted._id, Object.assign(votingExisted, vote))
      : await this.votingRepo.create(vote);

    await Promise.all(
      votingResult.map(voting =>
        this.auditRepo.logVoting({
          _id: undefined,
          eventId: shareholder.eventId as string,
          userId: executorId,
          data: VoteAuditData.create(votingExisted ? "updated" : "added", {
            voterName: shareholder.name,
            voterId: shareholder._id.toString(),
            votingResult: voting.response,
            shareholderId: shareholder._id.toString(),
            shareholderName: shareholder.name,
            resolutionId: voting.resolutionId as string,
            resolutionTitle: event.resolutions.find(reso => reso._id.toString() === voting.resolutionId).title
          })
        })
      )
    );

    return voting;
  }
}
