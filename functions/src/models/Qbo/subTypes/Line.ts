import { SalesItemLineDetail } from "./SalesItemLineDetail";
import { DiscountLineDetail } from "./DiscountLineDetail";
import { SubTotalLineDetail } from "./SubTotalLineDetail";
import { LineDetailType } from "../enums/LineDetailType";
import { GroupLineDetail } from "./GroupLineDetail";

/**
 * Individual line items of a transaction. 
 * Valid Line types include: 
 * Sales item line: Group item line Description only (also used for inline Subtotal lines) 
 * Discount line Subtotal Line (used for the overall transaction)
 */
export interface Line {
    Description: string;
    DetailType: LineDetailType;
    SalesItemLineDetail?: SalesItemLineDetail;
    LineNum?: number;
    Amount: number;
    Id?: string;
    SubTotalLineDetail?: SubTotalLineDetail;
    DiscountLineDetail?: DiscountLineDetail;
    GroupLineDetail?: GroupLineDetail
}

