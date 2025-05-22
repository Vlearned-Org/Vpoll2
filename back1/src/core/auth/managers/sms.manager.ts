import { Injectable } from "@nestjs/common";
import { Twilio } from "twilio";
import { OTPInvalidException } from "../exceptions/create-user.exception";

@Injectable()
export default class SmsService {
  private twilioClient: Twilio;
  private serviceSid;

  constructor() {
    const accountSid = "ACa95d79cbbe42e7d8d0aeae83d199c0fa";
    const authToken = "4885a8dcde21f6964d4406d4be974eec";
    this.serviceSid = "VA8e8fae607d2a11f2be73a73b9ff6ebc5";
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  public async initiatePhoneNumberVerification(phoneNumber: string) {
    return this.twilioClient.verify.services(this.serviceSid).verifications.create({ to: `+${phoneNumber}`, channel: "sms" });
  }

  public async validatePhoneNumberOwnership(phoneNumber: string, verificationCode: string) {
    const result = await this.twilioClient.verify
      .services(this.serviceSid)
      .verificationChecks.create({ to: `+${phoneNumber}`, code: verificationCode });

    if (!result.valid || result.status !== "approved") {
      throw new OTPInvalidException();
    }
  }
}
