import { Logger } from "@nestjs/common";
import { NotificationsFields } from "../notification.interface";
import { Channel } from "./abstract.channel";
const nodemailer = require("nodemailer");

const transportData ={
  host:"smtp.gmail.com", //"mail.vpoll.com.my",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    // type: 'login',
    user: "vpollsupport@aismartuallearning.com",
    pass: "vpgr betd twcc vvwz"
  },
   tls: {
     rejectUnauthorized: true
 },
logger: true,
debug: true
};

const transporter = nodemailer.createTransport(transportData);

export class EmailChannel extends Channel {
  public async send(notification: NotificationsFields): Promise<void> {
    const data = {
      from: `vpollsupport@aismartuallearning.com`,
      to: [notification.recipient.email],
      subject: notification.subject,
      html: notification.content
    };

    await transporter.sendMail(data, (err, info) => {
      if (err) Logger.error(err, "EmailChannel");
      Logger.log(info, "EmailChannel");
    });
    // }
  }
}
