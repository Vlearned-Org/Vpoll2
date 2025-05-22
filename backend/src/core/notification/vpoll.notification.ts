import { Company, User } from "@app/data/model";
import { Injectable } from "@nestjs/common";
import { NotificationType } from "./notification.enum";
import { NotificationManager } from "./notification.manager";

@Injectable()
export class VpollNotifications {
  constructor(private notification: NotificationManager) {}

  public async onAdminCreate(user: User, data: { company: Company; password: string }) {
    await this.notification.process(user.email, NotificationType.simple, {
      subject: `${data.company.name} assigned you as Vpoll Company Admin`,
      content: `
              Dear ${user.name},<br>
              <br>
              Your are assigned as the Vpoll Company Administrator for ${data.company.name}.<br>
              Here is your login details:<br>
              <b>Email:</b> ${user.email}<br>
              <b>Password:</b> ${data.password}<br>
              `
    });
  }

  public async onUserSubmitApproval(email: string, data: {}): Promise<void> {
    await this.notification.process(email, NotificationType.simple, {
      subject: "Vpoll account verification application received",
      content: `
            Dear,<br>
            <br>
            Your account verification application with the Vpoll is completed. Our Admin will confirm the approval within 24 hours.<br>
            `
    });
  }

  public async onUserApproved(email: string, data: {}): Promise<void> {
    await this.notification.process(email, NotificationType.simple, {
      subject: "Vpoll account registration is approved",
      content: `
          Dear, <br>
          <br>
          Your registration for Vpoll has been approved. You can start login to join events as shareholder/proxy.<br>
          `
    });
  }

  public async onUserReject(email: string, data: { reason: string }): Promise<void> {
    await this.notification.process(email, NotificationType.simple, {
      subject: "Vpoll account registration is rejected",
      content: `
        Dear,<br>
        <br>
        We are sorry to inform you that your request for registration with Vpoll is rejected due to incomplete information.<br>
        Reason: ${data.reason}<br>
        Kindly resubmit to restart the approval process.<br>
        Please connect to our admin team for further assistance.<br>
        `
    });
  }

  public async onInvite(email: string, data: {name:string,event:string,date:Date}): Promise<void> {
    await this.notification.process(email, NotificationType.simple, {
      subject: "Vpoll AGM Invitation Notification",
      content: `
          Dear ${data.name}, <br>
          <br>
          We are pleased to extend an invitation to you for the upcoming event  ${data.event}.<br>
          If you have not yet registered with Vpoll, we kindly request that you create an account at your earliest convenience to facilitate your participation in the event.<br>
          `
    });
  }

  public async onUserEnquiry(email: string, data: { name: string,email: string ,phone: string, companyname: string, subject: string , message: string}): Promise<void> {
    await this.notification.process(email, NotificationType.simple, {
      subject: "Vpoll received an enquiry",
      content: `
        Hi Admin,<br>
        <br>
        You have received an enquiry from a user <br>
        Name: ${data.name}<br>
        Email: ${data.email}<br>
        Phone: ${data.phone}<br>
        Company name: ${data.companyname}<br>
        Subject: ${data.subject}<br>
        Message: ${data.message}<br>
        Kindly reply to this enquiry.<br>
        `
    });
  }

  public async onResetPassword(email: string, data: { token: string }): Promise<void> {
    await this.notification.process(email, NotificationType.simple, {
      subject: "Vpoll password request",
      content: `Dear, 
      <br/><br> 
      You recently requested to reset your password for your Vpoll account.<br>Click the button below to reset it.<br/><br>
      <a style="padding:10px 15px; border-radius: 5px;background-color:#7B95A3;text-decoration:none;margin:10px auto;color:#fff;font-size:16px;" href="${process.env.APP_URL}/signin/reset-password?token=${data.token}">RESET NOW</a><br><br>
                Please change your password within 1 hour, or this link will become inactive.<br>
                You will have to request a new password after this delay.
              <br /> <br />If you did not request a password reset, please ignore this email.<br><br> Best regards. <br />BrioHR team.<br><br>
              <small>If you’re having trouble clicking the password reset button, please copy & paste this url in your browser:<br> ${process.env.APP_URL}/signin/reset-password?token=${data.token}</small>`
    });
  }
}
