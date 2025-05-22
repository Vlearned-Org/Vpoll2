import { Company } from "./company.interface";
import { User } from "./user.interface";
export interface Directory {
    name: string;
    files: InternalFile[];
}
export interface InternalFile {
    _id: string;
    name: string;
    company?: Company | string;
    user: User | string;
    uri: string;
    uuid?: string;
    extension?: string;
    size?: number;
}
export interface FileMetadata {
    originalName: string;
    contentType: string;
}
export declare type RichInternalFile = InternalFile & {
    metadata: FileMetadata;
};
