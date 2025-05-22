import { CreateCompanyData } from "@vpoll-shared/contract";
import { IsString } from "class-validator";

export class CreateCompanyDto implements CreateCompanyData {
  @IsString()
  public name: string;

  @IsString()
  public email: string;
}
