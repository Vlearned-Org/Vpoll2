import { CreateCompanyAdminDto } from "@app/api/dtos/user.dto";
import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { AccountVerificationStatusEnum, UserVerificationDto } from "@vpoll-shared/contract";
import { RoleEnum, UserStatusEnum, UserTokenEnum } from "@vpoll-shared/enum";
import { InjectModel } from "nestjs-typegoose";
import { Role, Token } from "../model";
import { User } from "../model/user.model";
import { AbstractRepository } from "./abstract.repository";
import moment = require("moment");

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  constructor(@InjectModel(User) protected readonly model: ReturnModelType<typeof User>) {
    super(model);
  }

  public async listNonAdminUsers(status: UserStatusEnum): Promise<Array<User>> {
    const mongoQuery = { isAdmin: false };
    if (status) {
      mongoQuery["status"] = status;
    }
    return this.model.find(mongoQuery);
  }

  public async listCompanyAdminUser(companyId: string): Promise<User[]> {
    return this.model.find({ "roles.role": RoleEnum.COMPANY_ADMIN, "roles.companyId": companyId });
  }

  public async findOneByToken(source: string, token: string): Promise<User> {
    return this.model.findOne({
      "tokens.source": source,
      "tokens.token": token
    });
  }

  public async setToken(source: UserTokenEnum, { userId, token, expiresAt }): Promise<User> {
    const user = await this.get(userId);
    const { tokens: userTokens } = user;
    const hasToken = userTokens.find(t => t.source === source);

    const updatedToken: Token = {
      source,
      token,
      expiresAt
    };

    if (!hasToken) {
      userTokens.push(updatedToken);
    } else {
      userTokens[userTokens.findIndex(t => t.source === source)] = updatedToken;
    }

    return this.model.findOneAndUpdate({ _id: userId }, { tokens: userTokens }, { new: true });
  }

  public async revokeToken(source: UserTokenEnum, userId: string): Promise<User> {
    const { tokens } = await this.model.findById(userId);
    const sourceIndex = tokens.findIndex(token => token.source === source);

    if (sourceIndex !== -1) {
      tokens[sourceIndex] = {
        source,
        token: tokens[sourceIndex].token,
        expiresAt: moment().toDate()
      };
    }

    return this.model.findOneAndUpdate({ _id: userId }, { $set: { tokens } });
  }

  public async setPassword(_id: string, password: string): Promise<User> {
    return this.model.findOneAndUpdate({ _id }, { $set: { password } }, { new: true });
  }

  public async setLoginAt(userId: string): Promise<User> {
    const user = await this.get(userId);
    if (!user.firstLoginAt) {
      await this.model.findOneAndUpdate({ _id: userId }, { $set: { firstLoginAt: moment().toDate() } }, { new: true });
    }
    return this.model.findOneAndUpdate({ _id: userId }, { $set: { lastLoginAt: moment().toDate() } }, { new: true });
  }

  public async createSystemUser(companyId: string, companyEmail: string, password: string): Promise<User> {
    const user: User = {
      isAdmin: true,
      name: "Company System Admin",
      email: companyEmail,
      password,
      status: UserStatusEnum.ACTIVE,
      roles: [{ role: RoleEnum.COMPANY_SYSTEM, companyId }]
    } as User;
    return this.model.create(user);
  }

  public async createCompanyAdmin(payload: CreateCompanyAdminDto): Promise<User> {
    const { companyId, name, email, password } = payload;
    const user: User = {
      isAdmin: true,
      name,
      email,
      password,
      status: UserStatusEnum.ACTIVE,
      roles: [{ role: RoleEnum.COMPANY_ADMIN, companyId }]
    } as User;
    return this.model.create(user);
  }

  public async createBasicUser(mobile: string,email: string, dataname: string, datanric: string, password: string): Promise<User> {
    const user: User = {
      isAdmin: false,
      mobile,
      email,
      password,
      name:dataname,
      nric:datanric,
      status: UserStatusEnum.PENDING,
      roles: []
    } as User;
    return this.model.create(user);
  }

  public async updateVerificationInfo(userId: string, payload: UserVerificationDto): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          accountVerificationStatus: AccountVerificationStatusEnum.PENDING,
          nric: payload.identity,
          nricRef: payload.identityDocument,
          email: payload.email,
          name: payload.name,
          rejectMessage: null
        }
      },
      { new: true, lean: true }
    );
  }

  public async updateRoles(userId: string, roles: Array<Role>): Promise<User> {
    return this.model.findOneAndUpdate({ _id: userId }, { $set: { roles } }, { new: true, lean: true });
  }

  public async insertRole(userId: string, role: Role): Promise<User> {
    return this.model.findOneAndUpdate({ _id: userId }, { $push: { roles: role } }, { new: true, lean: true });
  }

  public async withdrawRole(userId: string, role: Role): Promise<User> {
    return this.model.findOneAndUpdate({ _id: userId }, { $pull: { roles: role } }, { new: true, lean: true });
  }

  public async updateUserStatus(userId: string, status: UserStatusEnum): Promise<User> {
    return this.model.findOneAndUpdate({ _id: userId }, { $set: { status } });
  }

  public async approveUser(userId: string): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: { status: UserStatusEnum.ACTIVE, accountVerificationStatus: AccountVerificationStatusEnum.APPROVED } }
    );
  }
  public async find(criteria: any): Promise<User[]> {
    return this.model.find(criteria).lean().exec();
  }
  

  public async rejectUser(userId: string, rejectMessage: string): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: { status: UserStatusEnum.INACTIVE, accountVerificationStatus: AccountVerificationStatusEnum.REJECTED, rejectMessage } }
    );
  }
}
