import { firestore } from "firebase-admin";
import { QuickBooks } from "../../../../libs/qbmain";
import { OMCConfig } from "../../../../models/Daudi/omc/Config";
import { OMC } from "../../../../models/Daudi/omc/OMC";
import { TaxAgency } from "../../../../models/Qbo/TaxAgency";
import { TaxService } from "../../../../models/Qbo/TaxService";
import { initTaxAgency } from "./TaxAgency/init";

/**
 * This is the generl initialization process for every tax configuration there is
 * Child methods are called by this primary one, because they are al under the same category
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initTaxService(omc: OMC, config: OMCConfig, qbo: QuickBooks) {

    return initTaxAgency(qbo).then(response => {
        const res = response.TaxAgency as TaxAgency
        const taxRateName = "Fuel Tax Rate"
        const taxService: TaxService = {
            TaxCode: "KRA",
            TaxRateDetails: [
                {
                    RateValue: "8",
                    TaxAgencyId: res.Id,
                    TaxApplicableOn: "Sales",
                    TaxRateName: taxRateName
                }
            ]
        }
        return qbo.createTaxService(taxService).then(operationresult => {
            const ref = firestore()
                .collection("omc")
                .doc(omc.Id)
                .collection("config")
                .doc("main")

            return firestore().runTransaction(t => {
                return t.get(ref).then(data => {
                    const newconfig = data.data() as OMCConfig
                    const taxres = operationresult.Class as TaxService

                    const createdTaxRate = taxres.TaxRateDetails.find(rate => {
                        return rate.TaxRateName === taxRateName
                    })

                    newconfig.Qbo.taxConfig.taxAgency.Id = res.Id
                    newconfig.Qbo.taxConfig.taxCode.Id = taxres.TaxCodeId
                    newconfig.Qbo.taxConfig.taxRate.Id = createdTaxRate.TaxAgencyId
                    return t.update(ref, newconfig)
                })
            })
        });
    })


}
