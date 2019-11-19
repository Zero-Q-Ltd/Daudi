import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { Depot } from "../../../../models/Daudi/depot/Depot";
import { Class } from "../../../../models/Qbo/Class";

/**
 * Every depot is essentially a class, to allow tracking of sales per depot
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initDepots(omc: OMC, config: Config, environment: Environment, depots: Array<Depot>) {
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

    return createQbo(omc.Id, config, environment).then(result => {
        const qbo = result;
        return qbo.createItem(depotClasses).then(operationresult => {
            // console.log(innerresult);
            // const batch = firestore().batch();

            // batch.update(
            //     firestore()
            //         .collection("omc")
            //         .doc(omc.Id)
            //         .collection("config")
            //         .doc("main"),
            //     config
            // );
            const res = operationresult.Item as Array<Class>
            res.forEach(class_ => {
                config.depotconfig[environment][class_.Name].QbId = class_.Id
            })
            return firestore()
                .collection("omc")
                .doc(omc.Id)
                .collection("config")
                .doc("main")
                .update(config)
        });
    });
}
