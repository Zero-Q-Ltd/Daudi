import { ItemType } from "./enums/ItemType";
import { FuelType } from '../Daudi/fuel/FuelType';
import { ReferenceType } from "./subTypes/ClassRef";

export interface Item {
  Name: FuelType;
  Description: string;
  Active: boolean;
  FullyQualifiedName?: string;
  Taxable: true;
  UnitPrice: number;
  Type: ItemType;
  IncomeAccountRef: ReferenceType;
  PurchaseDesc?: string;
  PurchaseCost?: number;
  ExpenseAccountRef: ReferenceType;
  ParentRef?: ReferenceType;

  AssetAccountRef?: ReferenceType;
  TrackQtyOnHand: true;
  QtyOnHand: number;
  InvStartDate?: string;
  domain: "QBO";
  sparse: false;
  Id?: string;
  SyncToken: string;
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  SalesTaxCodeRef: ReferenceType,
  ClassRef?: ReferenceType,
  SalesTaxIncluded?: boolean
}

