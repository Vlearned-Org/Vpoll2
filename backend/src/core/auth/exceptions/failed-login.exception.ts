import { HttpStatus } from "@nestjs/common";
import { UserException } from "@vpoll-shared/errors/global-exception.filter";

export class FailedLoginException extends UserException<{ email?: string; mobile?: string }> {
  public code = "login";
  public status = HttpStatus.UNAUTHORIZED;
}
