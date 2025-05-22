import { HttpStatus } from "@nestjs/common";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";

export class NricExistedException extends UserException<{ nric: string }> {
  public code = "signup";
  public status = HttpStatus.PRECONDITION_FAILED;
}

export class MobileExistedException extends UserException<{ mobile: string }> {
  public code = "SIGNUP";
  public status = HttpStatus.PRECONDITION_FAILED;
}

export class OTPInvalidException extends UserException<{ mobile: string }> {
  public code = "signup";
  public status = HttpStatus.FORBIDDEN;
}

export class UserNotFoundException extends UserException<{
  nric: string;
  mobile: string;
}> {
  public code = "USER_NOT_FOUND";
  public status = HttpStatus.NOT_FOUND;
}
