import { HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "src/core/auth/auth.module";
import { CoreModule } from "src/core/core.module";
import { DataModule } from "src/data/data.module";
import { AdminCompanyController } from "./controllers/company-admin/company.controller";
import { EventController } from "./controllers/company-admin/event.controller";
import { InviteeController } from "./controllers/company-admin/invitee.controller";
import { ProxyController } from "./controllers/company-admin/proxy.controller";
import { CorporateController } from "./controllers/company-admin/corporate.controller";
import { ReportController } from "./controllers/company-admin/report.controller";
import { ResolutionController } from "./controllers/company-admin/resolution.controller";
import { ShareholderController } from "./controllers/company-admin/shareholder.controller";
import { MeController } from "./controllers/me/me.controller";
import { AdminAuthController } from "./controllers/public/admin-auth.controller";
import { UserAuthController } from "./controllers/public/user-auth.controller";
import { StorageController } from "./controllers/storage.controller";
import { EnquiriesController } from "./controllers/system/enquiry.controller";
import { CompaniesController } from "./controllers/system/company.controller";
import { UsersController, LegacyUsersController } from "./controllers/system/user.controller";
import { TestController } from "./controllers/test.controller";
import { WebsocketEventGateway } from "./websocket.gateway";

@Module({
  providers: [WebsocketEventGateway],
  imports: [DataModule, HttpModule, CoreModule, AuthModule],
  controllers: [
    CompaniesController,
    UsersController,
    LegacyUsersController,
    AdminAuthController,
    UserAuthController,
    EventController,
    ResolutionController,
    ShareholderController,
    ProxyController,
    CorporateController,
    InviteeController,
    MeController,
    StorageController,
    TestController,
    AdminCompanyController,
    ReportController,
    EnquiriesController
  ]
})
export class ApiModule {}
