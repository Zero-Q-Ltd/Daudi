import { DiscountAccountRef } from "../Estimate";
export interface DiscountLineDetail {
    DiscountAccountRef: DiscountAccountRef;
    PercentBased: boolean;
    DiscountPercent: number;
}
