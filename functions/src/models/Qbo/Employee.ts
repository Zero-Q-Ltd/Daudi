export interface Employee {
  SSN: string;
  PrimaryAddr: {
    Id: string;
    Line1: string;
    City: string;
    CountrySubDivisionCode: string;
    PostalCode: string;
  };
  BillableTime: false;
  domain: "QBO";
  sparse: false;
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  GivenName: string;
  FamilyName: string;
  DisplayName: string;
  PrintOnCheckName: string;
  Active: true;
  Mobile: {
    FreeFormNumber: string;
  };
  PrimaryPhone: {
    FreeFormNumber: string;
  };
  PrimaryEmailAddr: {
    Address: string;
  };
  Notes?: string;
  BirthDate: any;
  EmployeeNumber: string;

  Gender: "Male" | "Female";
}
