export interface CreateEnquiry {
    name: string;
    phoneNumber: string;
    email: string;
    company: string;
    subject: string;
    message: string;
}
export interface Enquiry {
    _id?: string;
    name: string;
    subject: string;
}
