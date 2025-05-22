import { Reader } from "./reader.interface";
import * as CSV from "csv-string";

export class CsvReader implements Reader {
  public fromFile(filePath: string): [] {
    throw new Error("Method not implemented.");
  }

  public fromStream(fileBuffer: Buffer): [] {
    return CSV.parse(fileBuffer.toString()) as any;
  }
}
