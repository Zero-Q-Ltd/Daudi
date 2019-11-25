import { TaxAgency } from "../../../../../models/Qbo/TaxAgency";
import { OMC } from "../../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../../models/Daudi/omc/Config";
import { Environment } from "../../../../../models/Daudi/omc/Environments";
import { QuickBooks } from "../../../../../libs/qbmain";
import { firestore } from "firebase-admin";

/**
 * There are 3 fuel types, where every fuel is an ITEM, as far as qbo is concerned
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initTaxCode(omc: OMC, config: Config, environment: Environment, qbo: QuickBooks) {
    /**
     * Simultaneously create the 3 fuel types on initialisation
     */
    const taxAgency: TaxCode = {

    }

    return qbo.createTaxAgency(taxAgency).then(operationresult => {
        const ref = firestore()
            .collection("omc")
            .doc(omc.Id)
            .collection("config")
            .doc("main")

        return firestore().runTransaction(t => {
            return t.get(ref).then(data => {
                const newconfig = data.data() as Config
                const res = operationresult.TaxAgency as TaxAgency
                newconfig.Qbo[environment].taxConfig.taxAgency.Id = res.Id
                return t.update(ref, newconfig)
            })
        })
    });
}
