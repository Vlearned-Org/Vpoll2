import { BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

// Password Guidelines
// As part of the pentest requirements, we will be implementing a simple password strength validation.
// For this validation, proposed layers of strength (each layer containing its own RegExp)
// are used to determine the final strength of the password.
// A valid password must contain a combination of all three layers listed below:

// String must contain both lowercased and uppercased characters
export const mixedCasedRegex: RegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])/);

// String must contain numbers ranging between 0-9
export const numericalRegex: RegExp = new RegExp(/^(?=.*[0-9])/);

// String must respect minimum length of 8
export const minLengthRegex: RegExp = new RegExp(/^(?=.{8,})/);

// The final validation used in the backend is a combination of all Regex's:
export const passwordRegex: RegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);

export class PasswordUtils {
  public static async hash(plainPassword: string, isSystem: boolean = false): Promise<string> {
    if (!isSystem && !passwordRegex.test(plainPassword)) {
      throw new BadRequestException("Invalid password format");
    }

    const salt = await bcrypt.genSalt();
    return bcrypt.hash(plainPassword, salt);
  }

  public static async check(plainPassword: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hash);
  }
}
