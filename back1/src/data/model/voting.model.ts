import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Voting as VotingContract } from "@vpoll-shared/contract";
import { VoterTypeEnum, VotingResponseEnum } from "@vpoll-shared/enum";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Event, Proxy, Resolution, Shareholder, User,Corporate } from ".";
import { AbstractModel } from "./abstract.model";
import { Company } from "./company.model";
import { InternalFile } from "./file.model";
@modelOptions({ schemaOptions: { timestamps: false } })
export class ResolutionVotingEntry {
  @IsMongoId()
  @prop({ required: true, ref: "Resolution" })
  public resolutionId: Ref<Resolution>;

  @IsEnum(VotingResponseEnum)
  @prop({ required: true, enum: VotingResponseEnum })
  public response: VotingResponseEnum;

  @IsNumber()
  @prop({ required: true })
  public numberOfShares: number;

  @IsNumber()
  @prop({ required: true })
  public maxnumberOfShares: number;
}

export class Voting extends AbstractModel implements VotingContract {
  @IsMongoId()
  @prop({ required: true, ref: "Company" })
  public companyId: Ref<Company>;

  @IsMongoId()
  @prop({ required: true, ref: "Event" })
  public eventId: Ref<Event>;

  @IsEnum(VoterTypeEnum)
  @prop({ required: true, enum: VoterTypeEnum })
  public voterType: VoterTypeEnum;

  @IsMongoId()
  @prop({ required: true, ref: "Shareholder", autopopulate: true })
  public shareholderId: Ref<Shareholder>;

  @IsMongoId()
  @prop({ required: true, ref: "User" })
  public executorId: Ref<User>;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "Proxy", autopopulate: true })
  public proxyId?: Ref<Proxy>;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "Corporate", autopopulate: true })
  public corporateId?: Ref<Corporate>;

  @IsBoolean()
  @prop({ required: true })
  public isPreVote: boolean;

  @ValidateNested({ each: true })
  @Type(() => ResolutionVotingEntry)
  @prop({ required: true, type: ResolutionVotingEntry })
  public result: Array<ResolutionVotingEntry>;

  @IsOptional()
  @IsMongoId()
  @prop({ ref: "InternalFile", autopopulate: true })
  public voteOnBehalfLetter?: InternalFile;
}
