import { VotingResponseEnum } from "@vpoll-shared/enum";
import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNumber, IsOptional, ValidateNested } from "class-validator";

export class ResolutionVotingDto {
  @IsMongoId()
  public resolutionId: string;

  @IsEnum(VotingResponseEnum)
  public response: VotingResponseEnum;

  @IsNumber()
  public numberOfShares: number;

  @IsNumber()
  public maxnumberOfShares: number;
}

export class ShareholderVotingDto {
  @ValidateNested({ each: true })
  @Type(() => ResolutionVotingDto)
  public voting: Array<ResolutionVotingDto>;

  @IsOptional()
  @IsMongoId()
  public letterId?: string;
}
