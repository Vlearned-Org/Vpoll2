import { ObjectId } from "bson";

export class StringUtils {
  public static generateRandomString(length = 10): string {
    const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
  }

  public static generatePassword(): string {
    const numeric = "0123456789";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";

    let result = "";

    for (let i = 0; i < 2; i++) {
      result += numeric.charAt(Math.floor(Math.random() * numeric.length));
      result += numeric.charAt(Math.floor(Math.random() * numeric.length));
      result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
      result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }

    // Shuffle result
    return result
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }

  public static startCase = (str: string): string => {
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
  };

  public static ObjectId = (m = Math, d = Date, h = 16, seconds = (s: number) => m.floor(s).toString(h)) =>
    seconds(d.now() / 1000) + " ".repeat(h).replace(/./g, () => seconds(m.random() * h));

  public static stripAccent = (label: string) => {
    const translate_re = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ]/g;
    const translate = "aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY";
    const newstr = label.replace(translate_re, match => {
      return translate.substr(translate_re.source.indexOf(match) - 1, 1);
    });

    return newstr.toLowerCase().replace(/ /g, "_");
  };

  public static slugify(string: string): string {
    if (!string) {
      return "";
    }
    return string
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\W_]+/g, "")
      .toLowerCase()
      .replace(/ /g, "-");
  }

  public static isObjectId(value: string): boolean {
    try {
      return new ObjectId(value).toString() === value;
    } catch (e) {
      return false;
    }
  }

  public static toUppercaseFirstLetter(string: string): string {
    if (!string || string.length === 0) {
      return "";
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public static removeAllNonNumberCharacters(string: string): string {
    if (!string) {
      return "";
    }
    return string.replace(/[^0-9]/g, "");
  }

  public static removeAllNonAlphabetCharacters(string: string): string {
    if (!string) {
      return "";
    }
    return string.replace(/[^a-zA-Z ]/g, "");
  }

  public static removeAllSpecialCharacters(string: string): string {
    if (!string) {
      return "";
    }
    return string.replace(/[^a-zA-Z0-9]/g, "");
  }

  public static removeAllHyphensAndForwardSlash(string: string): string {
    if (!string) {
      return "";
    }
    return string.replace(/-/g, "").replace(/\//g, "");
  }

  public static removeAllHyphens(string: string): string {
    if (!string) {
      return "";
    }
    return string.replace(/-/g, "");
  }

  public static replaceHyphensWithUnderscore(string: string): string {
    if (!string) {
      return "";
    }
    return string.replace(/-/g, "_");
  }

  public static fillFrontOfStringWithZeros(string: string, lengthExpected: number): string {
    if (!string) {
      return "0".repeat(lengthExpected);
    }
    if (string.length === lengthExpected) {
      return string;
    }
    if (string.length > lengthExpected) {
      return StringUtils.shrinkString(string, lengthExpected);
    }
    const nbZeroToAdd = lengthExpected - string.length;
    for (let i = 0; i < nbZeroToAdd; i++) {
      string = `0${string}`;
    }
    return string;
  }

  public static fillBackOfStringWithZeros(string: string, lengthExpected: number): string {
    if (!string) {
      return "0".repeat(lengthExpected);
    }

    if (string.length === lengthExpected) {
      return string;
    }
    if (string.length > lengthExpected) {
      return StringUtils.shrinkString(string, lengthExpected);
    }
    const spaceToAdd = lengthExpected - string.length;
    for (let i = 0; i < spaceToAdd; i++) {
      string = `${string}0`;
    }
    return string;
  }

  public static fillBackOfStringWithSpaces(string: string, lengthExpected: number): string {
    if (!string) {
      return StringUtils.emptyString(lengthExpected);
    }

    if (string.length === lengthExpected) {
      return string;
    }
    if (string.length > lengthExpected) {
      return StringUtils.shrinkString(string, lengthExpected);
    }
    const spaceToAdd = lengthExpected - string.length;
    for (let i = 0; i < spaceToAdd; i++) {
      string = `${string} `;
    }
    return string;
  }

  public static emptyString(length: number): string {
    return length > 0 ? " ".repeat(length) : "";
  }

  public static pipeString(length: number): string {
    return length > 0 ? "|".repeat(length) : "";
  }

  public static shrinkString(string: string, length: number): string {
    return string.substring(0, length);
  }

  public static capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public static nextChar(c: string): string {
    return String.fromCharCode(c.charCodeAt(0) + 1);
  }

  public static validEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
