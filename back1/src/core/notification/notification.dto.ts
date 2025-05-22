import { IsMongoId, IsOptional, IsString, IsEnum, Validate } from "class-validator";
import { NotificationType } from "./notification.enum";
import { ValidRecipient } from "./recipient.decorator";

export class NotificationDto {
  @Validate(ValidRecipient)
  public recipient: string;

  @IsEnum(NotificationType)
  public type: string;

  @IsMongoId()
  @IsOptional()
  public companyId: string;

  @IsOptional()
  public extraData: object;
}

export class ExtraDataValidator {
  @IsString()
  @IsOptional()
  public subject: string;

  @IsString()
  @IsOptional()
  public content: string;

  @IsString()
  @IsOptional()
  public sender: string;

  @IsString()
  @IsOptional()
  public attachment: string;
}

export class SimpleValidator extends ExtraDataValidator {}
