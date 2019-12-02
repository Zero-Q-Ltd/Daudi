import { TaxCodeRef, ItemRef } from "../Estimate";
export interface SalesItemLineDetail {
    TaxCodeRef: TaxCodeRef;
    Qty: number;
    UnitPrice: number;
    ItemRef: ItemRef;
}
