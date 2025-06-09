import { AskQuestionDto, UserVotingDto } from "@app/api/dtos/event.dto";
import { AskQuestionEvent } from "@app/core/events/ask-question.event";
import { VpollNotifications } from "@app/core/notification/vpoll.notification";
import { VotingCalculator } from "@app/core/voting/voting-calculator.utils";
import { VotingManager } from "@app/core/voting/voting.manager";

import { CompanyInformation, Proxy, Shareholder, User, Voting ,Corporate} from "@app/data/model";
import { AttendanceAuditData, QuestionAuditData ,LeaveAuditData} from "@app/data/model/audit.model";
import { AuditRepository } from "@app/data/repositories/audit.repository";
import { Bind, Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards, UnauthorizedException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  AskQuestionData,
  ChairmanIdentity,
  Context,
  Event,
  InviteeIdentity,
  PollingStatusEnum,
  ProxyIdentity,
  CorporateIdentity,
  ShareholderIdentity,
  UserEvent,
  UserVerificationDto
} from "@vpoll-shared/contract";
import { AuditTypeEnum, RoleEnum, VoterTypeEnum } from "@vpoll-shared/enum";
import { LogicException } from "@vpoll-shared/errors/global-exception.filter";
import { JwtAuthGuard } from "src/core/auth/strategies/jwt.strategy";
import * as bcrypt from "bcrypt";
import { ApiContext } from "src/core/context/api-context-param.decorator";
import {
  CompanyRepository,
  EventRepository,
  InviteeRepository,
  ProxyRepository,
  CorporateRepository,
  ShareholderRepository,
  UserRepository,
  VotingRepository
} from "src/data/repositories";
const KJUR = require("jsrsasign");

@Controller("api/me")
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private eventRepo: EventRepository,
    private companyRepo: CompanyRepository,
    private userRepo: UserRepository,
    private auditRepo: AuditRepository,
    private shareholderRepo: ShareholderRepository,
    private proxyRepo: ProxyRepository,
    private corporateRepo: CorporateRepository,
    private inviteeRepo: InviteeRepository,
    private votingManager: VotingManager,
    private votingRepo: VotingRepository,
    private eventEmitter: EventEmitter2,
    private notif: VpollNotifications
  ) {}

  @Get()
  public async getOwnUser(@ApiContext() context: Context): Promise<User> {
    const user = await this.userRepo.get(context.id);
    const shareholdersRoles = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
    const inviteeRoles = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
    const proxyRoles = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
    const corporateRoles = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

    const transformedArray1 = shareholdersRoles.map(item => ({
      role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
      : RoleEnum.CHAIRMAN,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray2 = inviteeRoles.map(item => ({
      role: RoleEnum.INVITEE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    const transformedArray3 = proxyRoles.map(item => ({
      role: RoleEnum.PROXY,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray4 = corporateRoles.map(item => ({
      role: RoleEnum.CORPORATE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    //context.roles = transformedArray;
    let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];

    user.roles = combinedRoles;

    console.log(user);
    return user;
  }

  @Patch("verfication-info")
  @Bind(ApiContext(), Body())
  public async submitVerificationInfo(context: Context, payload: UserVerificationDto): Promise<User> {
    const result = await this.userRepo.updateVerificationInfo(context.id, payload);
    await this.notif.onUserSubmitApproval(result.email, {});
    return result;
  }

  @Get("events")
  public async listEvents(@ApiContext() context: Context): Promise<Array<Event>> {


    const users = await this.userRepo.all({ _id: { $in: context.id } });
    const user = users[0]

    if (user.status !== "ACTIVE") {
      return this.eventRepo.all({ _id: { $in: [] } });
    }

    const shareholdersRoles = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
    const inviteeRoles = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
    const proxyRoles = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
    const corporateRoles = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

    const transformedArray1 = shareholdersRoles.map(item => ({
      role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
      : RoleEnum.CHAIRMAN,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray2 = inviteeRoles.map(item => ({
      role: RoleEnum.INVITEE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    const transformedArray3 = proxyRoles.map(item => ({
      role: RoleEnum.PROXY,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray4 = corporateRoles.map(item => ({
      role: RoleEnum.CORPORATE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    //context.roles = transformedArray;
    let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];

    const eventIds = combinedRoles.map(role => role.eventId);

    return this.eventRepo.all({ _id: { $in: eventIds } });
  }

  @Get("events/:eventId")
  public async getEventById(@ApiContext() context: Context, @Param("eventId") eventId: string): Promise<UserEvent> {
    // Add security
    const users = await this.userRepo.all({ _id: { $in: context.id } });
    const user = users[0]

    const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
    const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
    const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
    const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

    const transformedArray1 = shareholdersRolesrepo.map(item => ({
      role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
      : RoleEnum.CHAIRMAN,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray2 = inviteeRolesrepo.map(item => ({
      role: RoleEnum.INVITEE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    const transformedArray3 = proxyRolesrepo.map(item => ({
      role: RoleEnum.PROXY,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray4 = corporateRolesrepo.map(item => ({
      role: RoleEnum.CORPORATE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    //context.roles = transformedArray;
    let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];


    const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);


    if (!eventRoles.length || (user.status !== "ACTIVE")) {
      throw new ForbiddenException();
    }

    // Process roles
    const chairmanRole = eventRoles.find(role => role.role === RoleEnum.CHAIRMAN);
    const shareholderRoles = eventRoles.filter(role => role.role === RoleEnum.SHAREHOLDER);
    const proxyRoles = eventRoles.filter(role => role.role === RoleEnum.PROXY);
    const corporateRole = eventRoles.find(role => role.role === RoleEnum.CORPORATE);
    const inviteeRole = eventRoles.find(role => role.role === RoleEnum.INVITEE);

    // Default identity config
    let chairmanIdentity: ChairmanIdentity = {
      isChairman: false,
      hasProxies: false,
      proxies: [],
      secondProxies: []
    };
    let shareholderIdentity: ShareholderIdentity = {
      isShareholder: false,
      shareholders: [],
      proxies: []
    };
    let proxyIdentity: ProxyIdentity = {
      isProxy: false,
      proxies: []
    };
    let corporateIdentity: CorporateIdentity = {
      isCorporate: false,
      corporate: null
    };
    let inviteeIdentity: InviteeIdentity = {
      isInvitee: false,
      invitee: null
    };

    const event = await this.eventRepo.get(eventId);
    const company = await this.companyRepo.get(event.companyId.toString());
    const proxies = proxyRoles.length > 0 ? await this.proxyRepo.all({ eventId: event._id, _id: { $in: proxyRoles.map(r => r.refId) } }) : [];

    if (chairmanRole) {
      await this.shareholderRepo.get(chairmanRole.refId);
      chairmanIdentity.isChairman = true;

      chairmanIdentity.proxies = proxies;
      chairmanIdentity.secondProxies = await this.proxyRepo.all({
        eventId: event._id,
        "voteSetting.chairmanVoteOnBehalf": true,
        _id: { $nin: proxyRoles.map(r => r.refId) }
      });
      chairmanIdentity.hasProxies = chairmanIdentity.proxies.length + chairmanIdentity.secondProxies.length > 0 ? true : false;
    } else {
      if (proxyRoles.length > 0) {
        proxyIdentity.isProxy = true;
        proxyIdentity.proxies = proxies;
      }
    }

    if (shareholderRoles.length > 0) {
      const shareholders = await this.shareholderRepo.all({ _id: { $in: shareholderRoles.map(r => r.refId) } });
      const proxies = await this.proxyRepo.all({ shareholderId: { $in: shareholders.map(shar => shar._id.toString()) } });
      shareholderIdentity.isShareholder = true;
      shareholderIdentity.shareholders = shareholders.map(shareholder => {
        const shareholderSharesAllocatedToProxy = proxies
          .filter(proxy => (proxy.shareholderId as Shareholder)._id.toString() === shareholder._id.toString())
          .reduce((acc, proxy) => {
            return acc + proxy.allocatedShares;
          }, 0);
        return {
          ...JSON.parse(JSON.stringify(shareholder)),
          remainderShares: shareholder.numberOfShares - shareholderSharesAllocatedToProxy
        };
      });
      shareholderIdentity.proxies = proxies;
    }

    if (inviteeRole) {
      const invitee = await this.inviteeRepo.get(inviteeRole.refId);
      inviteeIdentity.isInvitee = true;
      inviteeIdentity.invitee = invitee;
    }
    if (corporateRole) {
      const corporate = await this.corporateRepo.get(corporateRole.refId);
      corporateIdentity.isCorporate = true;
      corporateIdentity.corporate = corporate;
    }

    return {
      company: {
        name: company.name,
        logo: company.information.logo ? company.information.logo.toString() : null
      },
      event,
      chairmanIdentity,
      shareholderIdentity,
      proxyIdentity,
      corporateIdentity,
      inviteeIdentity
    };
  }

  @Get("events/:eventId/lean")
  public async getEventLeanById(@ApiContext() context: Context, @Param("eventId") eventId: string): Promise<Event> {
    const users = await this.userRepo.all({ _id: { $in: context.id } });
    const user = users[0]

    const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
    const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
    const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
    const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

    const transformedArray1 = shareholdersRolesrepo.map(item => ({
      role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
      : RoleEnum.CHAIRMAN,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray2 = inviteeRolesrepo.map(item => ({
      role: RoleEnum.INVITEE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    const transformedArray3 = proxyRolesrepo.map(item => ({
      role: RoleEnum.PROXY,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray4 = corporateRolesrepo.map(item => ({
      role: RoleEnum.CORPORATE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    //context.roles = transformedArray;
    let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];

    const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);
    if (!eventRoles.length || (user.status !== "ACTIVE")) {
      throw new ForbiddenException();
    }

    return this.eventRepo.get(eventId);
  }

  // @Get("events/:eventId/life-stream")
  // public async getEventLiveStream(@ApiContext() context: Context, @Param("eventId") eventId: string) {
  //   // Add security
  //   const event = await this.eventRepo.get(eventId);
  // }

  @Post("events/:eventId/join")
  @Bind(ApiContext(), Param("eventId"), Body())
  public async joinEvent(context: Context, eventId: string, payload): Promise<void> {
    const attendanceLogs = await this.auditRepo.all({ eventId, userId: context.id, "data.type": AuditTypeEnum.ATTENDANCE });
    if (attendanceLogs.length === 0) {
      const users = await this.userRepo.all({ _id: { $in: context.id } });
      const user = users[0]

      const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
      const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
      const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
      const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

      const transformedArray1 = shareholdersRolesrepo.map(item => ({
        role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
        : RoleEnum.CHAIRMAN,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));

      const transformedArray2 = inviteeRolesrepo.map(item => ({
        role: RoleEnum.INVITEE,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));


      const transformedArray3 = proxyRolesrepo.map(item => ({
        role: RoleEnum.PROXY,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));

      const transformedArray4 = corporateRolesrepo.map(item => ({
        role: RoleEnum.CORPORATE,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));


      //context.roles = transformedArray;
      let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];


      const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);
      console.log(eventRoles)
      for (const eventRole of eventRoles) {
        let name = "";
        if (eventRole.role === RoleEnum.PROXY) {
          const proxy = await this.proxyRepo.get(eventRole.refId);
          name = proxy.name;
        }
        if (eventRole.role === RoleEnum.SHAREHOLDER || eventRole.role === RoleEnum.CHAIRMAN) {
          const shareholder = await this.shareholderRepo.get(eventRole.refId);
          name = shareholder.name;
        }
        if (eventRole.role === RoleEnum.INVITEE) {
          const invitee = await this.inviteeRepo.get(eventRole.refId);
          name = invitee.name;
        }
        if (eventRole.role === RoleEnum.CORPORATE) {
          const corporate = await this.corporateRepo.get(eventRole.refId);
          name = corporate.name;
        }
        await this.auditRepo.logAttendance({
          _id: null,
          eventId,
          userId: context.id,
          data: AttendanceAuditData.create(new Date(), eventRole.role, eventRole.refId, name)
        });
      }
    }
  }


  @Post("events/:eventId/leave")
  @Bind(ApiContext(), Param("eventId"), Body())
  public async leaveEvent(context: Context, eventId: string, payload): Promise<void> {
    const leaveLogs = await this.auditRepo.all({ eventId, userId: context.id, "data.type": AuditTypeEnum.LEAVE });
    if (leaveLogs.length >= 0 ) {
      const users = await this.userRepo.all({ _id: { $in: context.id } });
      const user = users[0]

      const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
      const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
      const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
      const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

      const transformedArray1 = shareholdersRolesrepo.map(item => ({
        role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
        : RoleEnum.CHAIRMAN,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));

      const transformedArray2 = inviteeRolesrepo.map(item => ({
        role: RoleEnum.INVITEE,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));


      const transformedArray3 = proxyRolesrepo.map(item => ({
        role: RoleEnum.PROXY,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));

      const transformedArray4 = corporateRolesrepo.map(item => ({
        role: RoleEnum.CORPORATE,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id
      }));


      //context.roles = transformedArray;
      let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];


      const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);
      console.log(eventRoles)
      for (const eventRole of eventRoles) {
        let name = "";
        if (eventRole.role === RoleEnum.PROXY) {
          const proxy = await this.proxyRepo.get(eventRole.refId);
          name = proxy.name;
        }
        if (eventRole.role === RoleEnum.SHAREHOLDER || eventRole.role === RoleEnum.CHAIRMAN) {
          const shareholder = await this.shareholderRepo.get(eventRole.refId);
          name = shareholder.name;
        }
        if (eventRole.role === RoleEnum.INVITEE) {
          const invitee = await this.inviteeRepo.get(eventRole.refId);
          name = invitee.name;
        }
        if (eventRole.role === RoleEnum.CORPORATE) {
          const corporate = await this.corporateRepo.get(eventRole.refId);
          name = corporate.name;
        }
        await this.auditRepo.logLeave({
          _id: null,
          eventId,
          userId: context.id,
          data: LeaveAuditData.create(new Date(), eventRole.role, eventRole.refId, name)
        });
      }
    }
  }


  @Post("events/:eventId/questions")
  @Bind(ApiContext(), Param("eventId"), Body())
  public async askQuestion(context: Context, eventId: string, payload: AskQuestionDto) {
    try {
      console.log("Received question:", payload.question);

      const users = await this.userRepo.all({ _id: { $in: context.id } });
      const user = users[0]

      const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
      const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
      const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
      const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

      const transformedArray1 = shareholdersRolesrepo.map(item => ({
        role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
        : RoleEnum.CHAIRMAN,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id.toString()
      }));

      const transformedArray2 = inviteeRolesrepo.map(item => ({
        role: RoleEnum.INVITEE,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id.toString()
      }));


      const transformedArray3 = proxyRolesrepo.map(item => ({
        role: RoleEnum.PROXY,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id.toString()
      }));

      const transformedArray4 = corporateRolesrepo.map(item => ({
        role: RoleEnum.CORPORATE,
        companyId: item.companyId.toString(),
        eventId: item.eventId.toString(),
        refId: item._id.toString()
      }));

      let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];
      const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);

      if (!eventRoles.length) {
        throw new ForbiddenException("No roles found for this event");
      }

      const chairmanR = eventRoles.find(role => role.role === RoleEnum.CHAIRMAN);
      const shareholderR = eventRoles.find(role => role.role === RoleEnum.SHAREHOLDER);

      let name = "";
      if (chairmanR) {
        const shareholder = await this.shareholderRepo.get(chairmanR.refId);
        name = shareholder.name;
      } else if (shareholderR) {
        const shareholder = await this.shareholderRepo.get(shareholderR.refId);
        name = shareholder.name;
      } else {
        const proxyR = eventRoles.find(role => role.role === RoleEnum.PROXY);
        if (proxyR) {
          const proxy = await this.proxyRepo.get(proxyR.refId);
          name = proxy.name;
        } else {
          const inviteeR = eventRoles.find(role => role.role === RoleEnum.INVITEE);
          if (inviteeR) {
            const invitee = await this.inviteeRepo.get(inviteeR.refId);
            name = invitee.name;
          }
          else{
            const corporateR = eventRoles.find(role => role.role === RoleEnum.CORPORATE);
            if (corporateR) {
              const corporate = await this.corporateRepo.get(corporateR.refId);
              name = corporate.name;
            }
          }
        }
      }

      const companyId = eventRoles[0].companyId.toString();

      // Create clean role objects to avoid potential circular references or mongoose metadata
      const sanitizedRoles = eventRoles.map(role => ({
        role: role.role,
        companyId: role.companyId,
        eventId: role.eventId,
        refId: role.refId
      }));

      console.log(`Asking question: "${payload.question}" by ${name}`);
      console.log(`Roles: ${JSON.stringify(sanitizedRoles)}`);

      // Create a properly structured audit document
      const questionAudit = {
        _id: null, // null ID will be replaced with MongoDB-generated ID
        eventId, // Use the string eventId directly
        userId: context.id,
        data: QuestionAuditData.create(name, sanitizedRoles, payload.question)
      };

      const result = await this.auditRepo.logQuestion(questionAudit);

      if (result && result._id) {
        this.eventEmitter.emit("ask-question", new AskQuestionEvent(companyId, eventId, result.data.question, result.data.roles));
      } else {
        console.error("Failed to create question audit record");
      }

      return payload;
    } catch (error) {
      console.error(`Error in askQuestion: ${error.message}`);
      console.error(error.stack);
      throw error; // Re-throw to ensure proper HTTP error response
    }
  }

  @Get("company")
  public async company(@ApiContext() context: Context) {
    return this.companyRepo.get(context.companyId);
  }

  @Patch("company/information")
  @Bind(ApiContext(), Body())
  public async updateCompanyInformation(context: Context, payload: CompanyInformation) {
    return this.companyRepo.updateCompanyInformation(context.companyId, payload);
  }

  @Post("events/:eventId/vote")
  @Bind(ApiContext(), Param("eventId"), Body())
  public async vote(context: Context, eventId: string, payload: UserVotingDto) {
    const users = await this.userRepo.all({ _id: { $in: context.id } });
    const user = users[0]

    const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
    const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
    const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
    const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

    const transformedArray1 = shareholdersRolesrepo.map(item => ({
      role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
      : RoleEnum.CHAIRMAN,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray2 = inviteeRolesrepo.map(item => ({
      role: RoleEnum.INVITEE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    const transformedArray3 = proxyRolesrepo.map(item => ({
      role: RoleEnum.PROXY,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));
    const transformedArray4 = corporateRolesrepo.map(item => ({
      role: RoleEnum.CORPORATE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    //context.roles = transformedArray;
    let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];


    const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);

    if (payload.type === "SHAREHOLDER") {
      const isShareholderSelf = eventRoles.find(
        role => role.eventId.toString() === eventId && role.role === RoleEnum.SHAREHOLDER && role.refId.toString() === payload.refId
      );
      if (isShareholderSelf) {
        const shareholder = await this.shareholderRepo.get(payload.refId, { eventId });
        return this.votingManager.voteAsShareholder(context.id, shareholder, payload.voting);
      }
    }
    if (payload.type === "PROXY") {
      const proxy = await this.proxyRepo.get(payload.refId);
      const isProxySelf = eventRoles.find(
        role => role.eventId.toString() === eventId && role.role === RoleEnum.PROXY && role.refId.toString() === payload.refId
      );
      const isChairman = eventRoles.find(role => role.eventId.toString() === eventId && role.role === RoleEnum.CHAIRMAN);
      if (isProxySelf) {
        return this.votingManager.voteAsProxy(context.id, proxy, payload.voting, false);
      } else if (isChairman && proxy.voteSetting.chairmanVoteOnBehalf) {
        return this.votingManager.voteAsProxy(context.id, proxy, payload.voting, true);
      }
    }


  }

  @Get("events/:eventId/vote")
  @Bind(ApiContext(), Param("eventId"), Query("type"), Query("refId"))
  public async getVoting(context: Context, eventId: string, type: "SHAREHOLDER" | "PROXY" , refId: string): Promise<Voting> {
    const users = await this.userRepo.all({ _id: { $in: context.id } });
    const user = users[0]

    const shareholdersRolesrepo = await this.shareholderRepo.all({ identityNumber: { $in: [user.nric] } });
    const inviteeRolesrepo = await this.inviteeRepo.all({ mobile: { $in: [user.mobile] } });
    const proxyRolesrepo = await this.proxyRepo.all({ identityNumber: { $in: [user.nric] } });
    const corporateRolesrepo = await this.corporateRepo.all({ mobile: { $in: [user.mobile] } });

    const transformedArray1 = shareholdersRolesrepo.map(item => ({
      role: (item.shareholderType.toLowerCase() === RoleEnum.SHAREHOLDER) ? RoleEnum.SHAREHOLDER
      : RoleEnum.CHAIRMAN,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    const transformedArray2 = inviteeRolesrepo.map(item => ({
      role: RoleEnum.INVITEE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));


    const transformedArray3 = proxyRolesrepo.map(item => ({
      role: RoleEnum.PROXY,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));
    const transformedArray4 = corporateRolesrepo.map(item => ({
      role: RoleEnum.CORPORATE,
      companyId: item.companyId.toString(),
      eventId: item.eventId.toString(),
      refId: item._id
    }));

    //context.roles = transformedArray;
    let combinedRoles = [...transformedArray1, ...transformedArray2, ...transformedArray3, ...transformedArray4];


    const eventRoles = combinedRoles.filter(role => role.eventId.toString() === eventId);

    if (type === "SHAREHOLDER") {
      const isShareholderSelf = eventRoles.find(
        role => role.eventId.toString() === eventId && role.role === RoleEnum.SHAREHOLDER && role.refId.toString() === refId
      );
      if (isShareholderSelf) {
        const shareholder = await this.shareholderRepo.get(refId, { eventId });
        return this.votingRepo.getOneBy("cds", shareholder.cds, {
          eventId,
          voterType: VoterTypeEnum.SHAREHOLDER,
          companyId: shareholder.companyId
        });
      }
    }
    if (type === "PROXY") {
      const proxy = await this.proxyRepo.get(refId);
      const voting = await this.votingRepo.getOneBy("cds", proxy.cds, { 
        eventId, 
        voterType: { $in: [VoterTypeEnum.PROXY, VoterTypeEnum.CHAIRMAN] },
        companyId: proxy.companyId
      });
      if (!voting) {
        return null;
      }
      const isProxySelf = eventRoles.find(
        role => role.eventId.toString() === eventId && role.role === RoleEnum.PROXY && role.refId.toString() === refId
      );
      const isChairman = eventRoles.find(role => role.eventId.toString() === eventId && role.role === RoleEnum.CHAIRMAN);
      const isShareholderOwnedProxy = eventRoles.find(
        role =>
          role.eventId.toString() === eventId &&
          role.role === RoleEnum.SHAREHOLDER &&
          role.refId.toString() === (voting.shareholderId as Shareholder)._id.toString()
      );

      if (isProxySelf) {
        return voting;
      } else if (isShareholderOwnedProxy) {
        return voting;
      } else if (isChairman && (voting.proxyId as Proxy).voteSetting.chairmanVoteOnBehalf) {
        return voting;
      }
    }


  }

  @Get("events/:eventId/polling-result")
  @Bind(ApiContext(), Param("eventId"))
  public async getPollingResult(context: Context, eventId: string) {
    const event = await this.eventRepo.get(eventId);
    if (event.polling.status === PollingStatusEnum.PUBLISH) {
      const votings = await this.votingRepo.all({
        //companyId: context.companyId,
        eventId
      });

      const shareholderCds = new Set(
        votings.filter(item => item.voterType === 'SHAREHOLDER').map(item => item.cds)
      );
      const filteredData = votings.filter(item => {
        if (item.voterType === 'PROXY') {
          return !shareholderCds.has(item.cds);
        }
        return true;
      });


      console.log(context.companyId);
      console.log(eventId);
      console.log(votings);
      return VotingCalculator.calculate(filteredData, event.resolutions);
    }
    throw new LogicException({ message: "Polling result is not ready" });
  }

  @Post("change-password")
  @Bind(ApiContext(), Body())
  public async changePassword(context: Context, payload: { currentPassword: string; newPassword: string }) {
    const user = await this.userRepo.get(context.id);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(payload.newPassword, saltRounds);

    // Update password
    await this.userRepo.setPassword(user._id, hashedNewPassword);

    return { message: "Password updated successfully" };
  }
}