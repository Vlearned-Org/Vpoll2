import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { Company, Event, InternalFile, Invitee, Proxy,Corporate, Shareholder, User, Voting,Enquiry } from "./model";
import { Audit } from "./model/audit.model";
import { LegacyUserRequest } from "./model/legacy-user-request.model";
import {
  CompanyRepository,
  EventRepository,
  InternalFileRepository,
  InviteeRepository,
  ProxyRepository,
  CorporateRepository,
  ShareholderRepository,
  UserRepository,
  VotingRepository,
  EnquiryRepository
} from "./repositories";
import { AuditRepository } from "./repositories/audit.repository";
import { LegacyUserRequestRepository } from "./repositories/legacy-user-request.repository";

export const REPOSITORIES = [
  UserRepository,
  CompanyRepository,
  EventRepository,
  ShareholderRepository,
  ProxyRepository,
  CorporateRepository,
  InviteeRepository,
  VotingRepository,
  InternalFileRepository,
  AuditRepository,
  EnquiryRepository,
  LegacyUserRequestRepository
];

@Module({
  imports: [TypegooseModule.forFeature([User, Company, Event, Shareholder, Proxy,Corporate, Invitee, Voting, InternalFile, Audit, Enquiry, LegacyUserRequest])],
  controllers: [],
  providers: [...REPOSITORIES],
  exports: [...REPOSITORIES]
})
export class DataModule {}
