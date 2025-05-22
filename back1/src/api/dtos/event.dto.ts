import { AskQuestionData, VotingData } from "@vpoll-shared/contract";
import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";
import { ResolutionVotingDto } from "./voting.dto";

export class AskQuestionDto implements AskQuestionData {
  @IsString()
  public question: string;
}

export class UserVotingDto implements VotingData {
  @IsString()
  public type: "PROXY" | "SHAREHOLDER";

  @IsString()
  public refId: string;

  @ValidateNested({ each: true })
  @Type(() => ResolutionVotingDto)
  public voting: Array<ResolutionVotingDto>;
}
