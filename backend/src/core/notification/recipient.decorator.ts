import { StringUtils } from "@vpoll-shared/utils/string.utils";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint()
export class ValidRecipient implements ValidatorConstraintInterface {
  public validate(recipient: string): boolean {
    return (
      StringUtils.isObjectId(recipient) || StringUtils.validEmail(recipient)
    );
  }

  public defaultMessage(): string {
    return "Recipient must be an ObjectId or a valid email.";
  }
}
