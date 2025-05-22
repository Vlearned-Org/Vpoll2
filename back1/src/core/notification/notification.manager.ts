import { UserRepository } from "src/data/repositories";
import { NotificationType } from "./notification.enum";
import { Notification } from "./notification.interface";
import { SimpleNotification } from "./notifications/simple.notification";

export class NotificationManager {
  constructor(private userRepo: UserRepository) {}

  public async process(email: string, type: NotificationType, extraData: {}): Promise<void> {
    const notification: Notification = this.factory(type);
    // let recipientDetail = recipient;

    // if (StringUtils.isObjectId(recipientDetail)) {
    //   console.log("is objectid", recipient);
    //   const user = await this.userRepo.get(recipient);
    //   if (user.email) {
    //     recipientDetail = user.email;
    //   } else {
    //     throw new LogicException({
    //       message: `User ${user._id} email not found`
    //     });
    //   }
    // }

    notification.setRecipient(email);
    await notification.setData(extraData);
    notification.process();
  }

  public factory(type: NotificationType) {
    switch (type) {
      case NotificationType.simple:
        return new SimpleNotification();
    }
  }
}
