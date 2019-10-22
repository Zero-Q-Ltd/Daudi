export interface Item {
  Name: string;
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
  PurchaseDesc: string;
  PurchaseCost: number;
  ExpenseAccountRef: {
    value: string;
    name: string;
  };
  ParentRef: {
    value: string;
    name: string;
  };

  AssetAccountRef: {
    value: string;
    name: string;
  };
  TrackQtyOnHand: true;
  QtyOnHand: number;
  InvStartDate: string;
  domain: "QBO";
  sparse: false;
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
}
