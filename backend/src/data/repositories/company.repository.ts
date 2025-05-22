import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { CompanyStatusEnum } from "@vpoll-shared/enum";
import { InjectModel } from "nestjs-typegoose";
import { Company, CompanyInformation } from "../model/company.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class CompanyRepository extends AbstractRepository<Company> {
  constructor(
    @InjectModel(Company)
    protected readonly model: ReturnModelType<typeof Company>
  ) {
    super(model);
  }

  public async updateCompanyInformation(companyId: string, information: CompanyInformation): Promise<Company> {
    return this.model.findOneAndUpdate({ _id: companyId }, { $set: { information } }, { new: true });
  }

  public async updateCompanyAdmin(companyId: string, adminUserId: string): Promise<Company> {
    return this.model.findOneAndUpdate({ _id: companyId }, { $set: { companyAdmin: adminUserId } }, { new: true });
  }

  public async updateStatus(companyId: string, status: CompanyStatusEnum): Promise<Company> {
    return this.model.findOneAndUpdate({ _id: companyId }, { $set: { status } }, { new: true });
  }
}
