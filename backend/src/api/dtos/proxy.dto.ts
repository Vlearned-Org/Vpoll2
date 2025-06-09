import { VoteSetting } from "@app/data/model";
import { AddProxy } from "@vpoll-shared/contract";
import { Type } from "class-transformer";
import { IsBoolean, IsMongoId, IsNumber, IsNumberString, IsOptional, IsString, ValidateNested } from "class-validator";
import { ResolutionVotingDto } from "./voting.dto";

export class AddProxyDto implements AddProxy {
  @IsOptional()
  @IsMongoId()
  public _id: string;

  @IsMongoId()
  public eventId: string;

  @IsMongoId()
  public shareholderId: string;

  @IsOptional()
  @IsMongoId()
  public shareholderAsProxyRefId?: string;

  @IsBoolean()
  public isChairmanAsProxy: boolean;

  @IsNumber()
  public allocatedShares: number;

  @IsOptional()
  @IsString()
  public mobile?: string;

  @IsMongoId()
  public proxyFormId: string;

  @ValidateNested({ always: true })
  @Type(() => VoteSetting)
  public voteSetting: VoteSetting;

  @IsString()
  public name: string;
  

  @IsString()
  public email: string;

  @IsNumberString()
  public cds: string;

  @IsString()
  public identityNumber: string;
}

export class AddProxyVotingDto {
  @ValidateNested({ each: true })
  @Type(() => ResolutionVotingDto)
  public result: Array<ResolutionVotingDto>;
}

export class EditProxyVotingDto extends AddProxyVotingDto {}
