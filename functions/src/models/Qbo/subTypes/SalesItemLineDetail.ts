import {TaxCodeRef} from "./TaxCodeRef";
import {ItemRef} from "./ItemRef";

export interface SalesItemLineDetail {
    TaxCodeRef: TaxCodeRef;
    Qty: number;
    UnitPrice: number;
    ItemRef: ItemRef;
}
