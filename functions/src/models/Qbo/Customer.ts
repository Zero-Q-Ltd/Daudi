import {ReferenceType} from "./subTypes/ClassRef";

export interface Customer {
  Taxable?: boolean;
  Job?: boolean;
  BillWithParent?: boolean;
  Balance?: number;
  BalanceWithJobs?: number;
  CurrencyRef?: ReferenceType;
  Notes?: string;
  PreferredDeliveryMethod?: "Email";
  domain?: "QBO";
  sparse?: boolean;
  Id?: string;
  SyncToken?: string;
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  FullyQualifiedName: string;
  PrintOnCheckName?: string;
  PrimaryTaxIdentifier?: string;
  Active?: true;
  DisplayName: string;
  BillAddr: {
    Lat: number;
    Long: number;
  };
  GivenName?: string;
  FamilyName?: string;
  CompanyName: string;
  PrimaryPhone: {
    FreeFormNumber: string;
  };
  PrimaryEmailAddr: {
    Address: string;
  };
  AlternatePhone?: {
    FreeFormNumber: string;
  };
}
