import {ReferenceType} from "./subTypes/ClassRef";

export interface TaxCode {
  Name: string;
  Description: string;
  Active: boolean;
  Taxable: boolean;
  TaxGroup: boolean;
  SalesTaxRateList: {
    TaxRateDetail: [
      {
        TaxRateRef: ReferenceType;
        TaxTypeApplicable: "TaxOnAmount";
        TaxOrder: 0;
      }
    ];
  };
  PurchaseTaxRateList: {
    TaxRateDetail: Array<any>;
  };
  domain: "QBO";
  sparse: false;
  Id: "12";
  SyncToken: "0";
  MetaData: {
    CreateTime: "2018-09-26T15:00:55-07:00";
    LastUpdatedTime: "2018-09-26T15:00:55-07:00";
  };
}
