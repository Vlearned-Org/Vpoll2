import { VotingResponse } from "@vpoll-shared/contract/voting-report.interface";
import { ResolutionTypeEnum, VotingResultEnum } from "@vpoll-shared/enum";

export class ResolutionCarriedUtils {
  public static resolutionCarriedDecision(resoType: ResolutionTypeEnum, forRes: VotingResponse): VotingResultEnum {
    switch (resoType) {
      case ResolutionTypeEnum.ORDINARY:
        return this.moreThan50PercentVoteFor(forRes) ? VotingResultEnum.CARRIED : VotingResultEnum.NOT_CARRIED;
      case ResolutionTypeEnum.SPECIAL:
        return this.moreThan75PercentVoteFor(forRes) ? VotingResultEnum.CARRIED : VotingResultEnum.NOT_CARRIED;
      case ResolutionTypeEnum.TWO_TIER:
        return this.bothTierMoreThan50PercentVoteFor(forRes) ? VotingResultEnum.CARRIED : VotingResultEnum.NOT_CARRIED;
    }
  }

  private static moreThan50PercentVoteFor(forRes: VotingResponse): boolean {
    return forRes.percentage > 50;
  }

  private static moreThan75PercentVoteFor(forRes: VotingResponse): boolean {
    return forRes.percentage > 75;
  }

  private static bothTierMoreThan50PercentVoteFor(forRes: VotingResponse): boolean {
    return forRes.smallPercentage > 50 && forRes.largePercentage > 50;
  }
}
