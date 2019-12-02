import { SalesItemLineDetail } from "./SalesItemLineDetail";
import { DiscountLineDetail } from "./DiscountLineDetail";
import { SubTotalLineDetail } from "../Estimate";
export interface Line {
    Description: string;
    DetailType: string;
    SalesItemLineDetail: SalesItemLineDetail;
    LineNum: number;
    Amount: number;
    Id?: string;
    SubTotalLineDetail: SubTotalLineDetail;
    DiscountLineDetail: DiscountLineDetail;

}
