import { VoterTypeEnum, VotingResponseEnum } from "../enum/voting.enum";
import { Company } from "./company.interface";
import { Event } from "./event.interface";
import { InternalFile } from "./filesystem.interface";
import { Proxy } from "./proxy.interface";
import { Resolution } from "./resolution.interface";
import { Shareholder } from "./shareholder.interface";
import { User } from "./user.interface";
export interface ResolutionVotingEntry {
    resolutionId: string | Resolution;
    response: VotingResponseEnum;
    numberOfShares: number;
    maxnumberOfShares: number;
}
export interface Voting {
    _id: string;
    companyId: string | Company;
    eventId: string | Event;
    executorId: string | User;
    voterType: VoterTypeEnum;
    shareholderId: string | Shareholder;
    proxyId?: string | Proxy;
    isPreVote: boolean;
    result: Array<ResolutionVotingEntry>;
    voteOnBehalfLetter?: InternalFile;
}
