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
      accountVerificationStatus: AccountVerificationStatusEnum.APPROVED,
      roles: [{ role: RoleEnum.COMPANY_SYSTEM, companyId }]
    } as User;
    return super.create(user);
  }

  public async createCompanyAdmin(payload: CreateCompanyAdminDto): Promise<User> {
    const { companyId, name, email, password } = payload;
    const user: User = {
      isAdmin: true,
      name,
      email,
      password,
      status: UserStatusEnum.ACTIVE,
      accountVerificationStatus: AccountVerificationStatusEnum.APPROVED,
      roles: [{ role: RoleEnum.COMPANY_ADMIN, companyId }]
    } as User;
    return super.create(user);
  }

  public async createBasicUser(email: string, password: string, dataname: string, datanric: string, mobile?: string): Promise<User> {
    const user: User = {
      isAdmin: false,
      email,
      password,
      name:dataname,
      nric:datanric,
      status: UserStatusEnum.ACTIVE,
      accountVerificationStatus: AccountVerificationStatusEnum.APPROVED,
      roles: [],
      mobile
    } as User;
    return super.create(user);
  }

  public async updateVerificationInfo(userId: string, payload: UserVerificationDto): Promise<User> {
    // Check if NRIC already exists (excluding current user)
    if (payload.identity) {
      const nricExists = await this.checkNricExists(payload.identity, userId);
      if (nricExists) {
        throw new Error(`NRIC ${payload.identity.toUpperCase()} is already registered with another user`);
      }
    }

    const updateData: any = {
      accountVerificationStatus: AccountVerificationStatusEnum.PENDING,
      nric: payload.identity,
      email: payload.email,
      name: payload.name,
      rejectMessage: null
    };

    // Only set nricRef if identityDocument is provided and is a valid ObjectId string
    if (payload.identityDocument) {
      updateData.nricRef = payload.identityDocument;
    }

    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
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

  public async listLegacyUsers(): Promise<Array<User>> {
    return this.model.find({
      isAdmin: false,
      $or: [
        // Explicitly marked as legacy user
        { isLegacyUser: true },
        // Has fallback contact information (indicates legacy user setup)
        { $and: [
          { fallbackContactName: { $exists: true } },
          { fallbackContactName: { $ne: null } },
          { fallbackContactName: { $ne: "" } }
        ]},
        // Users with no email AND no mobile AND requires assisted access
        { $and: [
          { $or: [
            { email: { $exists: false } },
            { email: null },
            { email: "" }
          ]},
          { $or: [
            { mobile: { $exists: false } },
            { mobile: null },
            { mobile: "" }
          ]},
          { requiresAssistedAccess: true }
        ]}
      ]
    });
  }

  public async createLegacyUser(userData: any): Promise<User> {
    const user: User = {
      ...userData,
      isAdmin: false,
      isLegacyUser: true,
      roles: []
    } as User;
    return super.create(user);
  }

  public async updateLegacyUser(userId: string, userData: any): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: userData },
      { new: true }
    );
  }

  public async setAccessCode(userId: string, accessCode: string, expiresAt: Date): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: { accessCode, accessCodeExpiresAt: expiresAt } },
      { new: true }
    );
  }

  public async markAsLegacyUser(userId: string): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: { isLegacyUser: true } },
      { new: true }
    );
  }

  public async unmarkLegacyUser(userId: string): Promise<User> {
    return this.model.findOneAndUpdate(
      { _id: userId },
      { $set: { isLegacyUser: false } },
      { new: true }
    );
  }

  public async checkNricExists(nric: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { nric: nric.toUpperCase() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const user = await this.model.findOne(query);
    return !!user;
  }
}
