import { TaxLine } from "./TaxLine";
export interface TxnTaxDetail {
    TxnTaxCodeRef: {
        value: string;
    };
    TotalTax?: number;
    /**
     * Only used for tax codes that are split into different amounts
     */
    TaxLine?: Array<TaxLine>;
}
