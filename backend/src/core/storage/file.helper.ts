const path = require("path");

export class FileHelper {
  public static removeExtension(filename: string): string {
    const filenameArray = filename.split(".");
    filenameArray.pop();
    return filenameArray.join(".");
  }

  public static getExtension(filename: string): string {
    return path.extname(filename).substr(1).toLowerCase();
  }
}
