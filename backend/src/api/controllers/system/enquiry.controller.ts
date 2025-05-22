import { CreateEnquiryDto } from "@app/api/dtos/enquiry.dto";
import { EnquiryManager } from "@app/core/enquiry.manager"; // Assuming you have this manager set up
import { ApiContext } from "@app/core/context/api-context-param.decorator";
import { Bind, Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Context } from "@vpoll-shared/contract";
import { RoleEnum } from "@vpoll-shared/enum";
import { HasRole } from "src/api/security/decorators/has-role.decorator";
import { RoleGuard } from "src/api/security/guards/role.guard";
import { JwtAuthGuard } from "src/core/auth/strategies/jwt.strategy";
import { EnquiryRepository } from "src/data/repositories";  // Assuming you have this repository set up

@Controller("api/enquiries")  // Note the change in endpoint to 'enquiries'
//@UseGuards(JwtAuthGuard, RoleGuard)
//@HasRole(RoleEnum.SYSTEM)
export class EnquiriesController {
  constructor(private enquiryRepo: EnquiryRepository, private enquiryManager: EnquiryManager) {}

  @Get()
  public async listEnquiries() {
    return await this.enquiryRepo.all();  // Just return all enquiries without additional mapping
  }

  @Post()
  @Bind(Body())
  public async createEnquiry( payload: CreateEnquiryDto) {
    console.log(payload);
    return this.enquiryManager.createEnquiry(payload);
  }

  // ... Add other necessary methods and endpoints for your enquiries as needed ...
}
