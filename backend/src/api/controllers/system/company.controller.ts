import { CreateCompanyDto } from "@app/api/dtos/company.dto";
import { CompanyManager } from "@app/core/company.manager";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Bind, Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";
import { HasRole } from "src/api/security/decorators/has-role.decorator";
import { RoleGuard } from "src/api/security/guards/role.guard";
import { JwtAuthGuard } from "src/core/auth/strategies/jwt.strategy";
import { CompanyRepository, UserRepository } from "src/data/repositories";

@Controller("api/companies")
@UseGuards(JwtAuthGuard, RoleGuard)
@HasRole(RoleEnum.SYSTEM)
export class CompaniesController {
  constructor(private companyRepo: CompanyRepository, private userRepo: UserRepository, private companyManager: CompanyManager) {}

  @Get()
  @Bind(ApiContext())
  public async listCompanies(context: Context) {
    const companies = await this.companyRepo.all();
    const systemUsers = await this.userRepo.all({ "roles.role": RoleEnum.COMPANY_SYSTEM });
    return companies.map(company => {
      return {
        company,
        systemUser: systemUsers.find(u => u.roles[0].companyId.toString() === company._id.toString())
      };
    });
  }

  @Get(":id")
  @Bind(ApiContext(), Param("id"))
  public async getCompanyById(context: Context, id: string) {
    return this.companyRepo.get(id);
  }

  @Post()
  @Bind(ApiContext(), Body())
  public async createCompany(context: Context, payload: CreateCompanyDto) {
    console.log(payload);
    return this.companyManager.createCompany(payload);
  }

  @Patch(":id/activate")
  @Bind(ApiContext(), Param("id"))
  public async activateCompanyById(context: Context, id: string) {
    return this.companyManager.activateCompany(id);
  }

  @Patch(":id/deactivate")
  @Bind(ApiContext(), Param("id"))
  public async deactivateCompanyById(context: Context, id: string) {
    return this.companyManager.deactivateCompany(id);
  }
}
