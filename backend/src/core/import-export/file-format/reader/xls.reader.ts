import * as xlsx from "node-xlsx";
import { Reader } from "./reader.interface";

export class XlsReader implements Reader {
  public fromFile(filePath: string): [] {
    throw new Error("Method not implemented.");
  }

  public fromStream(fileBuffer: Buffer, options?: {}): [] {
    if (!options) {
      options = { raw: false };
    }
    const workSheetsFromBuffer = xlsx.parse(fileBuffer, options);

    return workSheetsFromBuffer as any;
  }
}
