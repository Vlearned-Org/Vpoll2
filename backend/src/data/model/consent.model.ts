import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import { ObjectId } from "bson";
import { IsBoolean, IsEnum, IsOptional, IsString, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { AbstractModel } from "./abstract.model";

export enum ConsentType {
  DATA_PROCESSING = "dataProcessingConsent",
  TERMS_CONDITIONS = "termsAndConditions",
  MARKETING = "marketingConsent",
  ANALYTICS = "analyticsConsent",
  FUNCTIONAL_COOKIES = "functionalCookiesConsent",
  MARKETING_COOKIES = "marketingCookiesConsent",
  SOCIAL_MEDIA = "socialMediaConsent",
  EMAIL_COMMUNICATION = "emailCommunicationConsent",
  SMS_COMMUNICATION = "smsCommunicationConsent",
  PHONE_CALL = "phoneCallConsent",
  THIRD_PARTY_ANALYTICS = "thirdPartyAnalyticsConsent",
  LEGAL_COMPLIANCE = "legalComplianceConsent"
}

export enum LegalBasis {
  CONSENT = "Consent (Art. 6(1)(a) GDPR)",
  CONTRACT = "Contract (Art. 6(1)(b) GDPR)",
  LEGAL_OBLIGATION = "Legal Obligation (Art. 6(1)(c) GDPR)",
  VITAL_INTERESTS = "Vital Interests (Art. 6(1)(d) GDPR)",
  PUBLIC_TASK = "Public Task (Art. 6(1)(e) GDPR)",
  LEGITIMATE_INTEREST = "Legitimate Interest (Art. 6(1)(f) GDPR)",
  NECESSARY_FOR_SERVICE = "Necessary for service (Art. 6(1)(b) GDPR)"
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "consents"
  }
})
export class Consent extends AbstractModel {
  @prop({ type: ObjectId, required: true })
  @IsString()
  public userId: string;

  @prop({ required: true })
  @IsString()
  public consentId: string;

  @prop({ enum: ConsentType, required: true })
  @IsEnum(ConsentType)
  public consentType: ConsentType;

  @prop({ required: true })
  @IsBoolean()
  public granted: boolean;

  @prop({ required: true })
  @IsString()
  public purpose: string;

  @prop({ enum: LegalBasis, required: true })
  @IsEnum(LegalBasis)
  public legalBasis: LegalBasis;

  @prop({ required: true })
  @Type(() => Date)
  @IsDate()
  public timestamp: Date;

  @prop({ required: true })
  @IsString()
  public version: string;

  @prop()
  @IsOptional()
  @IsString()
  public ipAddress?: string;

  @prop()
  @IsOptional()
  @IsString()
  public userAgent?: string;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public withdrawnAt?: Date;

  @prop()
  @IsOptional()
  @IsString()
  public withdrawalReason?: string;

  @prop()
  @IsOptional()
  @IsString()
  public context?: string; // signup, login, settings_change, etc.
}

export enum DataSubjectRequestType {
  ACCESS = "access",
  RECTIFICATION = "rectification", 
  ERASURE = "erasure",
  RESTRICTION = "restriction",
  PORTABILITY = "portability",
  OBJECTION = "objection"
}

export enum DataSubjectRequestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled"
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "datasubjectrequests"
  }
})
export class DataSubjectRequest extends AbstractModel {
  @prop({ type: ObjectId, required: true })
  @IsString()
  public userId: string;

  @prop({ required: true })
  @IsString()
  public requestId: string;

  @prop({ enum: DataSubjectRequestType, required: true })
  @IsEnum(DataSubjectRequestType)
  public requestType: DataSubjectRequestType;

  @prop({ enum: DataSubjectRequestStatus, default: DataSubjectRequestStatus.PENDING })
  @IsEnum(DataSubjectRequestStatus)
  public status: DataSubjectRequestStatus;

  @prop({ required: true })
  @Type(() => Date)
  @IsDate()
  public requestDate: Date;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public completionDate?: Date;

  @prop({ required: true })
  @IsString()
  public description: string;

  @prop()
  @IsOptional()
  @IsString()
  public requestDetails?: string;

  @prop()
  @IsOptional()
  @IsString()
  public processedBy?: string;

  @prop()
  @IsOptional()
  @IsString()
  public rejectionReason?: string;

  @prop()
  @IsOptional()
  @IsString()
  public completionNotes?: string;

  @prop()
  @IsOptional()
  @IsString()
  public ipAddress?: string;

  @prop()
  @IsOptional()
  @IsString()
  public userAgent?: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "privacysettings"
  }
})
export class PrivacySettings extends AbstractModel {
  @prop({ type: ObjectId, required: true, unique: true })
  @IsString()
  public userId: string;

  @prop({ default: false })
  @IsBoolean()
  public emailCommunicationConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public smsCommunicationConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public phoneCallConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public marketingConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public analyticsConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public thirdPartyAnalyticsConsent: boolean;

  @prop({ default: true })
  @IsBoolean()
  public functionalCookiesConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public marketingCookiesConsent: boolean;

  @prop({ default: false })
  @IsBoolean()
  public socialMediaConsent: boolean;

  @prop({ default: true })
  @IsBoolean()
  public legalComplianceConsent: boolean;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public lastDataExport?: Date;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public retentionPeriodEnd?: Date;

  @prop({ default: "1.0" })
  @IsString()
  public consentVersion: string;

  @prop()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public lastConsentUpdate?: Date;
} 