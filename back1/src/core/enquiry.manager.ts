import { CreateEnquiryDto } from "@app/api/dtos/enquiry.dto";
import { Enquiry } from "@app/data/model";
import { EnquiryRepository } from "@app/data/repositories";
import { Injectable } from "@nestjs/common";
import { LogicException } from "@vpoll-shared/errors/global-exception.filter";
import * as nodemailer from 'nodemailer';
import { VpollNotifications } from "@app/core/notification/vpoll.notification";

@Injectable()
export class EnquiryManager {
  private transporter;
  constructor(private enquiryRepo: EnquiryRepository,private notif: VpollNotifications) {
        // Create a transporter object using the default SMTP transport
        this.transporter = nodemailer.createTransport({
          host:"mail.vpoll.com.my",
          port: 465,  // Use 587 for STARTTLS or 465 for SSL
          secure: true, // True if port 465 is used
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
        });
  }
  async sendEmail(to: string, subject: string, text: string) {
    console.log(`Attempting to send email to: ${to}, subject: ${subject}`);
    
    try {
      const info = await this.transporter.sendMail({
        from: "mailer@vpoll.com.my",
        to,
        subject,
        text,
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      throw new LogicException({
        message: "Email sending failed",
        metadata: { error },
      });
    }
  }

  public async createEnquiry(payload: CreateEnquiryDto): Promise<Enquiry> {
    const enquiry = await this.enquiryRepo.create(payload as Enquiry);

    if (!enquiry) {
      throw new LogicException({ message: "Enquiry creation failed", metadata: { input: payload } });
    }
    else{
      //this.sendEmail("waiyang@mmdt.cc", 'Enquiry:'+payload.subject, 'You have received an enquiry from: '+payload.email)
      await this.notif.onUserEnquiry("davidcheng@aismartuallearning.com", { name: payload.name,email: payload.email ,phone: payload.phoneNumber, companyname: payload.companyName, subject: payload.subject , 
        message: payload.message });

      await this.notif.onUserEnquiry("waiyang@mmdt.cc", { name: payload.name,email: payload.email ,phone: payload.phoneNumber, companyname: payload.companyName, subject: payload.subject , 
        message: payload.message });
    }

    return enquiry;
  }

  // ... add other necessary methods and functionality for Enquiry as needed ...
}
