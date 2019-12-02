export type TaxLine = {
    Amount?: number;
    DetailType: "TaxLineDetail";
    TaxLineDetail: {
        TaxRateRef: {
            value: string;
        };
        PercentBased?: boolean;
        TaxPercent?: number;
        NetAmountTaxable: number;
    };
};
