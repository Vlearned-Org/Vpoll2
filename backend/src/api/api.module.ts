import { HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "src/core/auth/auth.module";
import { CoreModule } from "src/core/core.module";
import { DataModule } from "src/data/data.module";
import { AdminCompanyController } from "./controllers/company-admin/company.controller";
import { AnalyticsController } from "./controllers/company-admin/analytics.controller";
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
import { LegacyUserRequestController } from "./controllers/system/legacy-user-request.controller";
import { TestController } from "./controllers/test.controller";
import { WebsocketEventGateway } from "./websocket.gateway";
import { PrivacyController } from "./controllers/privacy/privacy.controller";
import { PrivacyModule } from "@app/core/privacy/privacy.module";

@Module({
  providers: [WebsocketEventGateway],
  imports: [DataModule, HttpModule, CoreModule, AuthModule, PrivacyModule],
  controllers: [
    CompaniesController,
    UsersController,
    LegacyUsersController,
    LegacyUserRequestController,
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
    AnalyticsController,
    ReportController,
    EnquiriesController,
    PrivacyController
  ]
})
export class ApiModule {}
