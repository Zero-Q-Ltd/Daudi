
export interface LegalAddr {
    City: string;
    Country: string;
    Line1: string;
    PostalCode: string;
    CountrySubDivisionCode: string;
    Id: string;
}

export interface CompanyAddr {
    City: string;
    Country: string;
    Line1: string;
    PostalCode: string;
    CountrySubDivisionCode: string;
    Id: string;
}

export interface WebAddr {
    URI: string
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

export interface MetaData {
    CreateTime: Date;
    LastUpdatedTime: Date;
}

export interface CompanyInfo {
    SyncToken: string;
    domain: string;
    LegalAddr: LegalAddr;
    SupportedLanguages: string;
    CompanyName: string;
    Country: string;
    CompanyAddr: CompanyAddr;
    sparse: boolean;
    Id: string;
    WebAddr: WebAddr;
    FiscalYearStartMonth: string;
    CustomerCommunicationAddr: CustomerCommunicationAddr;
    PrimaryPhone: PrimaryPhone;
    LegalName: string;
    CompanyStartDate: string;
    Email: Email;
    NameValue: NameValue[];
    MetaData: MetaData;
}

export interface RootObject {
    CompanyInfo: CompanyInfo;
    time: Date;
}