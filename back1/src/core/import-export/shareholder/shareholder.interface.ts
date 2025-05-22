import { StructuredData } from "../import-export.interface";

export interface StructuredShareholder extends StructuredData {
  no: string;
  nric: string;
  pc: string;
  pbc: string;
  cdsNo: string;
  shareholderName: string;
  accQualifier: string;
  beneficiary: string;
  noOfShares: string;
  percentage: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  nationality: string;
  race: string;
  investorType: string;
  oldNric: string;
  ada: string;
  email: string;
}

export const DEFAULT_COLUMNS = [
  { label: "NO", key: "no" },
  { label: "NRIC / REG NO", key: "nric" },
  { label: "PC", key: "pc" },
  { label: "PBC", key: "pbc" },
  { label: "CDS NO", key: "cdsNo" },
  { label: "NAME OF SHAREHOLDER", key: "shareholderName" },
  { label: "ACCOUNT QUALIFIER (BENEFICIAL OWNER)", key: "accQualifier" },
  { label: "BENEFICIARY", key: "beneficiary" },
  { label: "SHARES", key: "noOfShares" },
  { label: "%", key: "percentage" },
  { label: "ADDRESS 1", key: "address1" },
  { label: "ADDRESS 2", key: "address2" },
  { label: "TOWN/CITY", key: "city" },
  { label: "ZIPCODE", key: "postcode" },
  { label: "STATE", key: "state" },
  { label: "COUNTRY", key: "country" },
  { label: "NATIONALITY", key: "nationality" },
  { label: "OWNERSHIP", key: "race" },
  { label: "INVESTOR TYPE", key: "investorType" },
  { label: "OLD IC", key: "oldNric" },
  { label: "ADA/ADM", key: "ada" }
];
