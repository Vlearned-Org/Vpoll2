import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { OTPInvalidException } from "../exceptions/create-user.exception"; // Assuming this can be reused or a new EmailOtpInvalidException created

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private otps: Map<string, { otp: string, expires: number }> = new Map(); // Simple in-memory OTP store

  constructor() {
    // Configuration from mail.js, ideally from config service
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.vlearned.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE || true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "support@vlearned.com",
        pass: process.env.SMTP_PASS || "[N20g(ERHFy,"
      },
      tls: {
        rejectUnauthorized: true
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      debug: true
      // logger: true, // Disable verbose logging for now
      // debug: true
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  public async initiateEmailVerification(email: string): Promise<void> {
    const otp = this.generateOtp();
    const expiryTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    this.otps.set(email, { otp, expires: expiryTime });

    const mailOptions = {
      from: process.env.SMTP_FROM || "support@vlearned.com",
      to: email,
      subject: 'Vpoll Email Verification Code',
      text: `Your Vpoll verification code is: ${otp}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear User,</p>
          <p>Your Vpoll email verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #333;">${otp}</p>
          <p>Please use this code to verify your email address. This code will expire in 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <br/>
          <p>Best regards,<br/>The Vpoll Team</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${email}: ${info.messageId}`);
      this.logger.log(`OTP for ${email} is ${otp}`); // For testing/dev purposes
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error.stack);
      throw new InternalServerErrorException('Failed to send verification email.');
    }
  }

  public async validateEmailOwnership(email: string, verificationCode: string): Promise<void> {
    const storedOtpData = this.otps.get(email);

    if (!storedOtpData) {
      throw new OTPInvalidException({ message: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > storedOtpData.expires) {
      this.otps.delete(email); // Clean up expired OTP
      throw new OTPInvalidException({ message: 'OTP has expired. Please request a new one.' });
    }

    if (storedOtpData.otp !== verificationCode) {
      throw new OTPInvalidException({ message: 'Invalid OTP.' });
    }

    this.otps.delete(email); // OTP is valid and used, remove it
    this.logger.log(`OTP validated for ${email}`);
  }
} 