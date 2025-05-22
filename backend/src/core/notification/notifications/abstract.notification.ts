import { Channel } from "../channels/abstract.channel";
import { ChannelTypes } from "../notification.enum";
import { Notification } from "../notification.interface";

import * as channels from "../channels/index";

export abstract class AbstractNotification implements Notification {
  public subject: string;
  public sender?: string;
  public content: string;
  public attachment: Array<{
    data: Buffer;
    filename: string;
  }>;
  public extraData: {};
  public recipient: {
    firstName?: string;
    preferredName?: string;
    name?: string;
    email: string;
    deviceIds?: Array<string>;
    subscriptions: Array<string>;
  };

  constructor() {
    this.subject = null;
    this.sender = "vpoll";
    this.content = null;
    this.extraData = {};
    this.recipient = {
      firstName: null,
      preferredName: null,
      name: null,
      email: null,
      deviceIds: [],
      subscriptions: []
    };
  }

  public setRecipient(recipient: string | object): void {
    if (typeof recipient === "string") {
      this.recipient.email = recipient;
      this.recipient.subscriptions = [ChannelTypes.EMAIL];
      return;
    }

    this.recipient.email = recipient["email"];
    this.recipient.deviceIds = recipient["deviceIds"] ?? [];
    this.recipient.firstName = recipient["firstName"];
    this.recipient.preferredName = recipient["preferredName"];
    this.recipient.name = recipient["name"];
    this.recipient.subscriptions = recipient["subscriptions"] ?? [ChannelTypes.EMAIL];
  }

  public process(): void {
    for (const channel of this.getChannels()) {
      // if (this.recipient.subscriptions.includes(channel)) {
      const channelType = `${channel[0].toUpperCase()}${channel.slice(1)}Channel`;
      console.log(channelType);
      const channelInstance: Channel = new channels[channelType]();
      const notification = {
        subject: this.subject,
        sender: this.sender,
        content: this.content,
        extraData: this.extraData,
        recipient: this.recipient,
        attachment: this.attachment
      };

      channelInstance.send(notification);
      // }
    }
  }

  public abstract getChannels(): Array<string>;

  public abstract setData(data: object);
}
