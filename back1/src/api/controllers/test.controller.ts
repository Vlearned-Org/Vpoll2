import { NotificationType } from "@app/core/notification/notification.enum";
import { NotificationManager } from "@app/core/notification/notification.manager";
import { Controller, Get } from "@nestjs/common";

@Controller("test")
export class TestController {
  constructor(private notification: NotificationManager) {}

  @Get("notification")
  public async testNotification(): Promise<void> {
    await this.notification.process("wayne12low@gmail.com", NotificationType.simple, {
      subject: "Testing",
      content: "Blablabla",
      sender: "system"
    });
  }
}
