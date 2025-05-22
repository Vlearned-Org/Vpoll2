import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { Company, Event, InternalFile, Invitee, Proxy,Corporate, Shareholder, User, Voting,Enquiry } from "./model";
import { Audit } from "./model/audit.model";
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
  EnquiryRepository
];

@Module({
  imports: [TypegooseModule.forFeature([User, Company, Event, Shareholder, Proxy,Corporate, Invitee, Voting, InternalFile, Audit, Enquiry])],
  controllers: [],
  providers: [...REPOSITORIES],
  exports: [...REPOSITORIES]
})
export class DataModule {}
