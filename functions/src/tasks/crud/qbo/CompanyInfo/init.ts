import { QuickBooks } from "../../../../libs/qbmain";
import { OMC } from "../../../../models/Daudi/omc/OMC";
import { CompanyInfo } from "../../../../models/Qbo/CompanyInfo";

export function initCompanyInfo(omc: OMC, qbo: QuickBooks) {
    /**
     * Convert Daudi OMC to QBO company Info
       */
    const companyInfo: CompanyInfo = {
        CompanyAddr: {
            City: "Kenya",
            Country: "Kenya",
            CountrySubDivisionCode: "Ke",
            Id: "1",
            Line1: "",
            PostalCode: ""
        },
        CompanyName: omc.name,
        Country: "Kenya",
        sparse: true,
        domain: "QBO",
        Id: "1",
        SyncToken: "10"
    }

    return qbo.updateCompanyInfo(companyInfo)
}
