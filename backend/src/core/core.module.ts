import { HttpModule, Module } from "@nestjs/common";
import { DataModule } from "src/data/data.module";
import { CompanyManager } from "./company.manager";
import { EnquiryManager } from "./enquiry.manager";
import { NotificationManager } from "./notification/notification.manager";
import { VpollNotifications } from "./notification/vpoll.notification";
import { ReportManager } from "./report/report.manager";
import { StorageManager } from "./storage/storage.manager";
import { ProxyManager } from "./voting/proxy.manager";

import { VotingManager } from "./voting/voting.manager";

@Module({
  imports: [HttpModule, DataModule],
  providers: [NotificationManager, StorageManager, CompanyManager,EnquiryManager, VpollNotifications, ProxyManager, VotingManager, ReportManager],
  exports: [NotificationManager, StorageManager, CompanyManager,EnquiryManager, VpollNotifications, ProxyManager, VotingManager, ReportManager]
})
export class CoreModule {}
