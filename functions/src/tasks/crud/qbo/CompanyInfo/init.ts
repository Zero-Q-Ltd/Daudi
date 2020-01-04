import { OMC } from "../../../../models/Daudi/omc/OMC";
import { OMCConfig } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { CompanyInfo } from "../../../../models/Qbo/CompanyInfo";
import { QuickBooks } from "../../../../libs/qbmain";
export function initCompanyInfo(omc: OMC, config: OMCConfig, environment: Environment, qbo: QuickBooks) {
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