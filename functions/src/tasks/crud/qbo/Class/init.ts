import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { Depot } from "../../../../models/Daudi/depot/Depot";
import { Class } from "../../../../models/Qbo/Class";
import { QuickBooks } from "../../../../libs/qbmain";

/**
 * Every depot is essentially a class, to allow tracking of sales per depot
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initDepots(omc: OMC, config: Config, environment: Environment, depots: Array<Depot>, qbo: QuickBooks) {
    /**
     * Simultaneously create the 3 fuel types on initialisation
     */
    const generalclass: Class = {
        Active: true,
        Name: "",
        domain: "QBO",

    }
    const depotClasses: Array<Class> = depots.map(depot => {
        return { ...generalclass, ...{ Name: depot.Name } }
    });

    return qbo.createClass([depotClasses]).then(operationresult => {
        const ref = firestore()
            .collection("omc")
            .doc(omc.Id)
            .collection("config")
            .doc("main")

        return firestore().runTransaction(t => {
            return t.get(ref).then(data => {
                const newconfig = data.data() as Config
                const res = operationresult.Class as Array<Class>
                res.forEach(class_ => {
                    newconfig.depotconfig[environment][class_.Name].QbId = class_.Id
                })
                return t.update(ref, newconfig)
            })
        })
    });
}
