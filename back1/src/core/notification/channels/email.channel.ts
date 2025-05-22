import { Logger } from "@nestjs/common";
import { NotificationsFields } from "../notification.interface";
import { Channel } from "./abstract.channel";
const nodemailer = require("nodemailer");

const transportData ={
  host:"mail.vpoll.com.my", //"mail.vpoll.com.my",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    // type: 'login',
    user: "mailer@vpoll.com.my",
    pass: "seUzcPEqokf8bt9"
  },
//   tls: {
//     secureProtocol: 'TLSv1_2_method',
//     rejectUnauthorized: false
// },
logger: true,
debug: true
};

const transporter = nodemailer.createTransport(transportData);

export class EmailChannel extends Channel {
  public async send(notification: NotificationsFields): Promise<void> {
    const data = {
      from: `mailer@vpoll.com.my`,
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
