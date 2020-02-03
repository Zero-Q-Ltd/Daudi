export type TaxLine = {
    Amount?: number;
    DetailType: "TaxLineDetail";
    TaxLineDetail: {
        /**
         * Reference to a TaxRate to apply to the entire transaction.
         *  Query the TaxRate name list resource to determine the appropriate TaxRage object for this reference.
         *  Use TaxRate.Id and TaxRate.Name from that object for TaxRateRef.value and TaxRateRef.name, respectively.
         *  For non-US versions of QuickBooks, the TaxRate referenced here must also be one of the rates in the referenced tax code's
         *  rate list—either the SalesTaxRateList or the PurchaseTaxRateList—as applies to the transaction type. Any given rate may only be listed onc
         */
        TaxRateRef: {
            value: string;
        };
        PercentBased?: boolean;
        TaxPercent?: number;
        NetAmountTaxable: number;
    };
};
