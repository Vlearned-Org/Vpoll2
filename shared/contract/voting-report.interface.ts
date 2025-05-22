import { ResolutionTypeEnum, VotingResultEnum } from "@vpoll-shared/enum";
import { Company } from "./company.interface";
import { Voting } from "./voting.interface";

export interface ReportShape<T> {
  company: Company;
  event: Event;
  data: T;
}

export type ProxyVotingReport = ReportShape<{
  resolutionsResult: Array<ResolutionVotingResult>;
  votings: Array<Voting>;
}>;

export interface ResolutionVotingResult {
  index: number;
  type: ResolutionTypeEnum;
  title: string;
  totalShares: number;
  totalSharesExcludeAbstain: number;
  minorSharesExcludeAbstain?: number;
  majorSharesExcludeAbstain?: number;
  for: VotingResponse;
  against: VotingResponse;
  abstain: VotingResponse;
  result: VotingResultEnum;
}

export interface VotingResponse {
  unit: number;
  smallUnit?: number;
  largeUnit?: number;
  percentage: number;
  smallPercentage?: number;
  largePercentage?: number;
  record: number;
  smallRecord?: number;
  largeRecord?: number;
}
