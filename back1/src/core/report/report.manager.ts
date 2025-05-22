import {
  CompanyRepository,
  EventRepository,
  InviteeRepository,
  ProxyRepository,
  ShareholderRepository,
  UserRepository,
  VotingRepository,
  CorporateRepository
} from "@app/data/repositories";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Injectable } from "@nestjs/common";
import { RoleEnum, VoterTypeEnum } from "@vpoll-shared/enum";
import { Response } from "express";
import { VotingCalculator } from "../voting/voting-calculator.utils";
import { AttendanceReport } from "./types";
import { ProxyConsolidatedVotingReport } from "./types/proxy-consolidated";
import { QuestionReport } from "./types/question";
import { VotingReport } from "./types/voting";

@Injectable()
export class ReportManager {
  constructor(
    private companyRepo: CompanyRepository,
    private eventRepo: EventRepository,
    private votingRepo: VotingRepository,
    private auditRepo: AuditRepository,
    private userRepo: UserRepository,
    private shareholderRepo: ShareholderRepository,
    private proxyRepo: ProxyRepository,
    private inviteeRepo: InviteeRepository,
    private corporateRepo: CorporateRepository
  ) {}

  public async generateProxyConsolidatedReport(companyId: string, eventId: string, res: Response) {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const votings = await this.votingRepo.all({ companyId, eventId, voterType: { $in: [VoterTypeEnum.CHAIRMAN, VoterTypeEnum.PROXY] } });
    const stream = await ProxyConsolidatedVotingReport.generate({ company, event, data: votings });
    const response = this.setResponseHeader(res);
    return stream.pipe(response);
  }

  public async generateProxyVotingReport(companyId: string, eventId: string, res: Response) {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const votings = await this.votingRepo.all({ companyId, eventId, voterType: { $in: [VoterTypeEnum.CHAIRMAN, VoterTypeEnum.PROXY] } });
    const results = VotingCalculator.calculate(votings, event.resolutions);
    const stream = await VotingReport.generate({
      company,
      event,
      data: {
        results,
        votings
      }
    });
    const response = this.setResponseHeader(res);
    return stream.pipe(response);
  }

  public async generateVotingReport(companyId: string, eventId: string, res: Response) {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const votings = await this.votingRepo.all({ companyId, eventId });
    const shareholderIds = new Set(
      votings.filter(item => item.voterType === 'SHAREHOLDER').map(item => String(item.shareholderId))
    );

    const filteredData = votings.filter(item => {
      if (item.voterType === 'PROXY') {
        return !shareholderIds.has(String(item.shareholderId));
      }
      return true;
    });
    
    const results = VotingCalculator.calculate(filteredData, event.resolutions);
    const stream = await VotingReport.generate({
      company,
      event,
      data: {
        results,
        votings
      }
    });
    const response = this.setResponseHeader(res);
    return stream.pipe(response);
  }

  public async generateAttendanceReport(companyId: string, eventId: string, res: Response) {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const attendance = await this.auditRepo.listAttendance(eventId);
    const leave = await this.auditRepo.listLeave(eventId);

    const shareholderIds = [];
    const proxyIds = [];
    const inviteeIds = [];
    const corporateIds = [];
    for (let att of attendance) {
      if (att.data.role === RoleEnum.SHAREHOLDER) {
        shareholderIds.push(att.data.ref);
      } else if (att.data.role === RoleEnum.PROXY) {
        proxyIds.push(att.data.ref);
      } else if (att.data.role === RoleEnum.INVITEE) {
        inviteeIds.push(att.data.ref);
      }else if (att.data.role === RoleEnum.CORPORATE) {
        corporateIds.push(att.data.ref);
      }
      
    }

    for (let lev of leave) {
      if (lev.data.role === RoleEnum.SHAREHOLDER) {
        shareholderIds.push(lev.data.ref);
      } else if (lev.data.role === RoleEnum.PROXY) {
        proxyIds.push(lev.data.ref);
      } else if (lev.data.role === RoleEnum.INVITEE) {
        inviteeIds.push(lev.data.ref);
      }else if (lev.data.role === RoleEnum.CORPORATE) {
        corporateIds.push(lev.data.ref);
      }
      
    }
    const [shareholders, proxies, invitees ,corporates] = await Promise.all([
      this.shareholderRepo.all({ _id: { $in: shareholderIds } }),
      this.proxyRepo.all({ _id: { $in: proxyIds } }),
      this.inviteeRepo.all({ _id: { $in: inviteeIds } }),
      this.corporateRepo.all({ _id: { $in: corporateIds } })
    ]);

    const stream = await AttendanceReport.generate({
      company,
      event,
      data: {
        attendance,
        shareholders,
        proxies,
        invitees,
        corporates,
        leave
      }
    });
    const response = this.setResponseHeader(res);
    return stream.pipe(response);
  }

  public async generateQuestionReport(companyId: string, eventId: string, res: Response) {
    const company = await this.companyRepo.get(companyId);
    const event = await this.eventRepo.get(eventId, { companyId });
    const questions = await this.auditRepo.listQuestion(eventId);
    const users = await this.userRepo.all({ _id: { $in: questions.map(q => q.userId) } });
    const stream = await QuestionReport.generate({
      company,
      event,
      data: {
        questions,
        users
      }
    });
    const response = this.setResponseHeader(res);
    return stream.pipe(response);
  }

  private setResponseHeader(res: Response): Response {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="download-${Date.now()}.xlsx"`);
    return res;
  }
}
