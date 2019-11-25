
export interface TaxRateDetail {
    RateValue: string;
    TaxRateId?: string;
    TaxApplicableOn: "Sales" | "Purchase";
    TaxAgencyId: string;
    TaxRateName: string;
}

export interface TaxService {
    TaxRateDetails: TaxRateDetail[];
    TaxCodeId?: string;
    TaxCode: string;
}
