import { ChannelTypes } from "./notification.enum";

export interface Notification {
  subject: string;
  sender?: string;
  content: string;
  extraData: {};
  recipient: {
    firstName?: string;
    name?: string;
    email: string;
    deviceIds?: Array<string>;
    subscriptions: Array<string>;
  };

  getChannels: () => Array<string>;
  setRecipient: (recipient: string | object) => void;
  setData: (data: object) => Promise<void>;
  process: () => void;
}

export interface NotificationsFields {
  subject: string;
  sender: string;
  content: string;
  attachment?: Array<{
    data: Buffer;
    filename: string;
  }>;
  extraData: {};
  recipient: {
    firstName?: string;
    name?: string;
    email: string;
    deviceIds?: Array<string>;
    subscriptions: Array<ChannelTypes>;
  };
}
