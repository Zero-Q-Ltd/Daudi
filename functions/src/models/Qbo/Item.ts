import { fuelTypes } from "../common";

export interface Item {
  Name: fuelTypes;
  Description: string;
  Active: boolean;
  FullyQualifiedName: string;
  Taxable: true;
  UnitPrice: number;
  Type: "Inventory" | "Service" | "NonInventory" | "Group" | "Category";
  IncomeAccountRef: {
    value: string;
    name: string;
  };
  PurchaseDesc?: string;
  PurchaseCost?: number;
  ExpenseAccountRef: {
    value: string;
    name: string;
  };
  ParentRef?: {
    value: string;
    name: string;
  };

  AssetAccountRef?: {
    value: string;
    name: string;
  };
  TrackQtyOnHand: true;
  QtyOnHand: number;
  InvStartDate: string;
  domain: "QBO";
  sparse: false;
  Id?: number;
  SyncToken: string;
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  SalesTaxCodeRef: {
    value: string;
    name: string;
  },
  ClassRef?: {
    value: string;
    name: string;
  },
  SalesTaxIncluded?: boolean
}
