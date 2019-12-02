import { DiscountAccountRef } from "./DiscountAccountRef";
export interface DiscountLineDetail {
    DiscountAccountRef: DiscountAccountRef;
    PercentBased: boolean;
    DiscountPercent: number;
}
