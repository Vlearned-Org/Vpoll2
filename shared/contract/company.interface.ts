import { CompanyStatusEnum } from "../enum/company.enum";
import { Address } from "./common.interface";
import { RichInternalFile } from "./filesystem.interface";

export interface CreateCompanyData {
  name: string;
}

export interface UpdateCompanyAdminData {
  companyAdminName: string;
  companyAdminEmail: string;
}

export interface CompanyInfo {
  registrationNumber: string;
  address: Address;
  logo?: RichInternalFile | string;
  email: string;
  phone: string;
}

export interface Company {
  _id?: string;
  name: string;
  status: CompanyStatusEnum;
  information?: CompanyInfo;
}
