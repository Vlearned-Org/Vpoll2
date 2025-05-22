export declare class StringUtils {
    static generateRandomString(length?: number): string;
    static generatePassword(): string;
    static startCase: (str: string) => string;
    static ObjectId: (m?: Math, d?: DateConstructor, h?: number, seconds?: (s: number) => string) => string;
    static stripAccent: (label: string) => string;
    static slugify(string: string): string;
    static isObjectId(value: string): boolean;
    static toUppercaseFirstLetter(string: string): string;
    static removeAllNonNumberCharacters(string: string): string;
    static removeAllNonAlphabetCharacters(string: string): string;
    static removeAllSpecialCharacters(string: string): string;
    static removeAllHyphensAndForwardSlash(string: string): string;
    static removeAllHyphens(string: string): string;
    static replaceHyphensWithUnderscore(string: string): string;
    static fillFrontOfStringWithZeros(string: string, lengthExpected: number): string;
    static fillBackOfStringWithZeros(string: string, lengthExpected: number): string;
    static fillBackOfStringWithSpaces(string: string, lengthExpected: number): string;
    static emptyString(length: number): string;
    static pipeString(length: number): string;
    static shrinkString(string: string, length: number): string;
    static capitalizeFirstLetter(string: string): string;
    static nextChar(c: string): string;
    static validEmail(email: string): boolean;
}
