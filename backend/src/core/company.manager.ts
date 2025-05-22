import { CreateCompanyDto } from "@app/api/dtos/company.dto";
import { CreateCompanyAdminDto } from "@app/api/dtos/user.dto";
import { Company, User } from "@app/data/model";
import { CompanyRepository, UserRepository } from "@app/data/repositories";
import { Injectable } from "@nestjs/common";
import { CompanyStatusEnum, RoleEnum } from "@vpoll-shared/enum";
import { LogicException, UserException } from "@vpoll-shared/errors/global-exception.filter";
import { StringUtils } from "@vpoll-shared/utils/string.utils";
import { PasswordUtils } from "./auth/managers/password.utils";
import { VpollNotifications } from "./notification/vpoll.notification";

@Injectable()
export class CompanyManager {
  private systemBasePassword = process.env.SYSTEM_PASSWORD;

  constructor(private companyRepo: CompanyRepository, private userRepo: UserRepository, private vpollNotif: VpollNotifications) {}

  public async createCompany(payload: CreateCompanyDto): Promise<Company> {
    const company = await this.companyRepo.create({
      name: payload.name,
      email:payload.email,
      status: CompanyStatusEnum.ACTIVE
    } as Company);
    const companyName = company.name.replace(/\s/g, "").toLowerCase();
    const companyEmail = company.email.replace(/\s/g, "").toLowerCase();

    await this.userRepo.createSystemUser(company._id, companyEmail, await PasswordUtils.hash(this.systemBasePassword, true));

    if (!company) {
      throw new LogicException({ message: "Company create fail", metadata: { input: payload } });
    }

    return company;
  }

  public async activateCompany(companyId: string) {
    return this.companyRepo.updateStatus(companyId, CompanyStatusEnum.ACTIVE);
  }

  public async deactivateCompany(companyId: string) {
    return this.companyRepo.updateStatus(companyId, CompanyStatusEnum.INACTIVE);
  }

  public async createCompanyAdmin(payload: CreateCompanyAdminDto): Promise<User> {
    const user = await this.userRepo.getOneBy("email", payload.email);
    if (user) {
      const roleExisted = user.roles.find(role => role.companyId.toString() === payload.companyId.toString() && role.role == RoleEnum.COMPANY_ADMIN);
      if (roleExisted) {
        throw new UserException({ message: "Double entry: the same email with the role assign existed." });
      }
      return this.userRepo.updateRoles(user._id, [...user.roles, { role: RoleEnum.COMPANY_ADMIN, companyId: payload.companyId }]);
    }

    const generatedPassword = "vpoll";//StringUtils.generatePassword();
    payload.password = await PasswordUtils.hash(generatedPassword, true);
    const created = await this.userRepo.createCompanyAdmin(payload);
    const company = await this.companyRepo.get(payload.companyId);
    await this.vpollNotif.onAdminCreate(created, { company, password: generatedPassword });
    return created;
  }


  
}
