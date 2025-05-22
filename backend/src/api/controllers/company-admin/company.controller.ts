import { CreateCompanyAdminDto } from "@app/api/dtos/user.dto";
import { HasRole } from "@app/api/security/decorators/has-role.decorator";
import { RoleGuard } from "@app/api/security/guards/role.guard";
import { JwtAuthGuard } from "@app/core/auth/strategies/jwt.strategy";
import { CompanyManager } from "@app/core/company.manager";
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Company, CompanyInformation, User } from "@app/data/model";
import { CompanyRepository, UserRepository } from "@app/data/repositories";
import { Bind, Body, Controller, Get, Patch, Post, Res, UseGuards } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";

@Controller("api/company")
@UseGuards(JwtAuthGuard, RoleGuard)
export class AdminCompanyController {
  constructor(private companyRepo: CompanyRepository, private userRepo: UserRepository, private companyManager: CompanyManager) {}

  @Get("admin")
  @HasRole([RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN])
  @Bind(ApiContext())
  public async getCompanyAdmin(context: Context): Promise<User[]> {
    return this.userRepo.listCompanyAdminUser(context.companyId);
  }

  @Post("admin")
  @HasRole([RoleEnum.COMPANY_SYSTEM])
  @Bind(ApiContext(), Body())
  public async createCompanyAdmin(context: Context, payload: CreateCompanyAdminDto): Promise<User> {
    payload.companyId = context.companyId;
    return this.companyManager.createCompanyAdmin(payload);
  }

  @Get()
  @Bind(ApiContext())
  public async getCompanyById(context: Context): Promise<Company> {
    return this.companyRepo.get(context.companyId);
  }

  @Patch()
  @Bind(ApiContext(), Body())
  public async updateCompanyById(context: Context, info: CompanyInformation): Promise<Company> {
    return this.companyRepo.updateCompanyInformation(context.companyId, info);
  }

  @Get("shareholder-template")
  @Bind(ApiContext(), Res())
  public async downloadShareholderFileTemplate(context: Context) {}
}
