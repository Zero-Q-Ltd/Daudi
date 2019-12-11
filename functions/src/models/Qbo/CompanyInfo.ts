import { QboMetaData } from "./subTypes/QboMetaData";
import { WebAddr } from './subTypes/WebAddr';

export interface Address {
    City: string;
    Country: string;
    Line1: string;
    PostalCode: string;
    CountrySubDivisionCode: string;
    Id: string;
}

export interface CustomerCommunicationAddr {
    City: string;
    Country: string;
    Line1: string;
    PostalCode: string;
    CountrySubDivisionCode: string;
    Id: string;
}

export interface PrimaryPhone {
    FreeFormNumber: string;
}

export interface Email {
    Address: string;
}

export interface NameValue {
    Name: string;
    Value: string;
}
/**
 * I have deliberately ommited some field that require an accountants expertise, 
 * (maybe to come as an upgrade ??)
 */
export interface CompanyInfo {
    SyncToken?: string;
    domain: "QBO";
    SupportedLanguages?: string;
    CompanyName: string;
    Country: string;
    /**
     * Required for update
PhysicalAddress
Company Address as described in preference.
If a physical address is updated from within the transaction object, 
the QuickBooks Online API flows individual address components differently into 
the Line elements of the transaction response then when the transaction was first created:
Line1 and Line2 elements are populated with the customer name and company name.
Original Line1 through Line 5 contents, City, SubDivisionCode, and PostalCode flow into Line3 through Line5as a free format strings.
     */
    CompanyAddr: Address;
    sparse: true;
    Id?: string;
    WebAddr?: WebAddr;
    PrimaryPhone?: PrimaryPhone;
    LegalName?: string;
    CompanyStartDate?: string;
    Email?: Email;
    /**
     * Deliberately ommited
     */
    NameValue?: NameValue[];
    MetaData?: QboMetaData;
}
