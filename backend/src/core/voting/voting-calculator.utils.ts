import { Resolution, ResolutionVotingEntry, Shareholder, Voting } from "@app/data/model";
import { ResolutionTypeEnum, VotingResponseEnum } from "@vpoll-shared/enum";
import { ResolutionVotingResult, VotingResponse } from "../../../../shared/contract/voting-report.interface";
import { ResolutionCarriedUtils } from "./resolution-carried.utils";

interface ResolutionVoteEntry {
  unit: number;
  smallUnit: number;
  largeUnit: number;
  record: number;
  smallRecord: number;
  largeRecord: number;
}

interface ResolutionEntry {
  totalShares: number;
  totalSharesExcludeAbstain: number;
  minorSharesExcludeAbstain: number;
  majorSharesExcludeAbstain: number;
  for: ResolutionVoteEntry;
  against: ResolutionVoteEntry;
  abstain: ResolutionVoteEntry;
}

export class VotingCalculator {
  public static calculate(votings: Voting[], resolutions: Resolution[]): Array<ResolutionVotingResult> {
    const resoVoteEntryMap = this.compileVotesToResolutionEntryMap(votings, resolutions);

    const consolidatedResolutionVotingResult = resolutions.map(reso => {
      const resolutionEntry = resoVoteEntryMap.get(reso._id.toString());
      return this.compileResolutionVotingResult(reso, resolutionEntry);
    });
    return consolidatedResolutionVotingResult;
  }

  private static compileResolutionVotingResult(resolution: Resolution, resolutionEntry: ResolutionEntry): ResolutionVotingResult {
    console.log(resolutionEntry);
    const forPercentage = (resolutionEntry.for.unit / resolutionEntry.totalSharesExcludeAbstain) * 100;
    const againstPercentage = (resolutionEntry.against.unit / resolutionEntry.totalSharesExcludeAbstain) * 100;

    let twoTierForResponse = {},
      twoTierAgainstResponse = {};
    if (resolution.type === ResolutionTypeEnum.TWO_TIER) {
      twoTierForResponse = this.computeTwoTierPercentage("for", resolutionEntry);
      twoTierAgainstResponse = this.computeTwoTierPercentage("against", resolutionEntry);
    }

    const forRes: VotingResponse = {
      unit: resolutionEntry.for.unit,
      record: resolutionEntry.for.record,
      percentage: isNaN(forPercentage) ? 0 : forPercentage,
      ...twoTierForResponse
    };
    const againstRes: VotingResponse = {
      unit: resolutionEntry.against.unit,
      percentage: isNaN(againstPercentage) ? 0 : againstPercentage,
      record: resolutionEntry.against.record,
      ...twoTierAgainstResponse
    };
    return {
      index: resolution.index,
      type: resolution.type,
      title: resolution.title,
      totalShares: resolutionEntry.totalShares,
      totalSharesExcludeAbstain: resolutionEntry.totalSharesExcludeAbstain,
      for: forRes,
      against: againstRes,
      abstain: {
        unit: resolutionEntry.abstain.unit ?? 0,
        percentage: null,
        record: resolutionEntry.abstain.record
      },
      result: ResolutionCarriedUtils.resolutionCarriedDecision(resolution.type, forRes)
    };
  }

  private static computeTwoTierPercentage(key: "for" | "against", resolutionEntry: ResolutionEntry) {
    const smallUnit = resolutionEntry[key].smallUnit;
    const largeUnit = resolutionEntry[key].largeUnit;
    const smallPercentage = (smallUnit / resolutionEntry.minorSharesExcludeAbstain) * 100;
    const largePercentage = (largeUnit / resolutionEntry.majorSharesExcludeAbstain) * 100;
    return {
      smallUnit: isNaN(smallUnit) ? 0 : smallUnit,
      largeUnit: isNaN(largeUnit) ? 0 : largeUnit,
      smallRecord: resolutionEntry[key].smallRecord,
      largeRecord: resolutionEntry[key].largeRecord,
      smallPercentage: isNaN(smallPercentage) ? 0 : smallPercentage,
      largePercentage: isNaN(largePercentage) ? 0 : largePercentage
    };
  }

  private static compileVotesToResolutionEntryMap(votings: Voting[], resolutions: Resolution[]): Map<string, ResolutionEntry> {
    return votings.reduce((resoMapAcc, voting) => {
      const isLargeShareholder = (voting.shareholderId as Shareholder).isLargeShareholder;
      for (let resolutionResult of voting.result) {
        const resolutionId = resolutionResult.resolutionId.toString();
        const accumulatedResult = resoMapAcc.get(resolutionId);
        resoMapAcc.set(resolutionId, this.accumulateResolutionEntry(accumulatedResult, isLargeShareholder, resolutionResult));
      }
      return resoMapAcc;
    }, this.initializeResolutionEntryMap(resolutions));
  }

  private static accumulateResolutionEntry(result: ResolutionEntry, isLargeShareholder: boolean, resoRes: ResolutionVotingEntry): ResolutionEntry {
    const { numberOfShares } = resoRes;
    result.totalShares += numberOfShares;

    switch (resoRes.response) {
      case VotingResponseEnum.FOR:
        result.totalSharesExcludeAbstain += numberOfShares;
        result.for.record += 1;
        result.for.unit += numberOfShares;
        if (isLargeShareholder) {
          result.majorSharesExcludeAbstain += numberOfShares;
          result.for.largeRecord += 1;
          result.for.largeUnit += numberOfShares;
        } else {
          result.minorSharesExcludeAbstain += numberOfShares;
          result.for.smallRecord += 1;
          result.for.smallUnit += numberOfShares;
        }
        break;
      case VotingResponseEnum.AGAINST:
        result.totalSharesExcludeAbstain += numberOfShares;
        result.against.record += 1;
        result.against.unit += numberOfShares;
        if (isLargeShareholder) {
          result.majorSharesExcludeAbstain += numberOfShares;
          result.against.largeRecord += 1;
          result.against.largeUnit += numberOfShares;
        } else {
          result.minorSharesExcludeAbstain += numberOfShares;
          result.against.smallRecord += 1;
          result.against.smallUnit += numberOfShares;
        }
        break;
      case VotingResponseEnum.ABSTAIN:
        result.abstain.record += 1;
        result.abstain.unit += numberOfShares;
        if (isLargeShareholder) {
          result.abstain.largeRecord += 1;
          result.abstain.largeUnit += numberOfShares;
        } else {
          result.abstain.smallRecord += 1;
          result.abstain.smallUnit += numberOfShares;
        }
        break;
    }
    return result;
  }

  private static initializeResolutionEntryMap(resolutions: Resolution[]): Map<string, ResolutionEntry> {
    const resoMap: Map<string, ResolutionEntry> = new Map();
    for (let reso of resolutions) {
      const emptyResolutionVoteEntry: ResolutionVoteEntry = {
        unit: 0,
        smallUnit: 0,
        largeUnit: 0,
        record: 0,
        smallRecord: 0,
        largeRecord: 0
      };
      resoMap.set(reso._id.toString(), {
        totalShares: 0,
        totalSharesExcludeAbstain: 0,
        minorSharesExcludeAbstain: 0,
        majorSharesExcludeAbstain: 0,
        for: { ...emptyResolutionVoteEntry },
        against: { ...emptyResolutionVoteEntry },
        abstain: { ...emptyResolutionVoteEntry }
      });
    }
    return resoMap;
  }

  // public async voteAsShareholder(executorId: string, shareholder: Shareholder, votingResult: Array<ResolutionVotingResult>, isPreVote: boolean) {
  //   const vote: Voting = {
  //     companyId: shareholder.companyId,
  //     eventId: shareholder.eventId,
  //     shareholderId: shareholder._id,
  //     voterType: VoterTypeEnum.SHAREHOLDER,
  //     isPreVote,
  //     result: votingResult,
  //     executorId
  //   } as Voting;
  //   const voting = await this.votingRepo.create(vote);
  //   // audit log
  // }

  // public async chairmanVote(
  //   executorId: string,
  //   chairman: Shareholder,
  //   shareholderId: string,
  //   votingResult: Array<ResolutionVotingResult>,
  //   isPreVote: boolean
  // ) {
  //   const vote: Voting = {
  //     companyId: chairman.companyId,
  //     eventId: chairman.eventId,
  //     shareholderId,
  //     voterType: VoterTypeEnum.CHAIRMAN,
  //     isPreVote,
  //     result: votingResult,
  //     executorId
  //   } as Voting;
  //   const voting = await this.votingRepo.create(vote);
  //   // audit log
  // }

  // public async generateProxyConsolidatedVotingReport(companyId: string, eventId: string) {}

  // public async generateProxyVotingReport(companyId: string, eventId: string) {
  //   const event = await this.eventRepo.get(eventId, { companyId });
  //   const votes = await this.votingRepo.all({ companyId, eventId, voterType: VoterTypeEnum.PROXY });

  //   for (const resolution of event.resolutions) {
  //   }
  // }
}
