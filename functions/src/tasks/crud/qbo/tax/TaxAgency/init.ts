import {TaxAgency} from "../../../../../models/Qbo/TaxAgency";
import {QuickBooks} from "../../../../../libs/qbmain";

/**
 * There are 3 fuel types, where every fuel is an ITEM, as far as qbo is concerned
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initTaxAgency(qbo: QuickBooks) {
    /**
     * Simultaneously create the 3 fuel types on initialisation
     */
    const taxAgency: TaxAgency = {
        DisplayName: "KRA",
        TaxTrackedOnPurchases: true,
        TaxTrackedOnSales: true,
        domain: "QBO",
    }

    return qbo.createTaxAgency(taxAgency)
}
