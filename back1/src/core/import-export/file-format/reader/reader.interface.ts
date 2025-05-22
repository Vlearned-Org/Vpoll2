export interface Reader {
  fromFile(filePath: string): [];
  fromStream(fileBuffer: Buffer): [];
}
