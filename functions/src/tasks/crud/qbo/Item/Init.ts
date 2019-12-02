import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { Item } from "../../../../models/Qbo/Item";
import { fueltypesArray } from "../../../../models/Daudi/fuel/fuelTypes";
import { fuelTypes } from "../../../../models/common";
import { QuickBooks } from "../../../../libs/qbmain";

/**
 * There are 3 fuel types, where every fuel is an ITEM, as far as qbo is concerned
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initFuels(omc: OMC, config: Config, environment: Environment, qbo: QuickBooks) {
    /**
     * Simultaneously create the 3 fuel types on initialisation
     */
    const generalfuel: Item = {
        Active: true,
        Name: "pms",
        Taxable: true,
        TrackQtyOnHand: true,
        sparse: false,
        UnitPrice: 0,

        SyncToken: "0",
        Type: "Inventory",
        QtyOnHand: 0,
        Description: "",
        IncomeAccountRef: {
            name: "",
            value: ""
        },
        ExpenseAccountRef: {
            name: "",
            value: ""
        },
        SalesTaxCodeRef: {
            name: "",
            value: ""
        },
        domain: "QBO",
    }
    const fuelItems: Array<Item> = fueltypesArray.map((fuel: fuelTypes) => {
        return { ...generalfuel, ...{ Name: fuel } }
    });

    return qbo.createItem(fuelItems[0]).then(operationresult => {
        const ref = firestore()
            .collection("omc")
            .doc(omc.Id)
            .collection("config")
            .doc("main")

        return firestore().runTransaction(t => {
            return t.get(ref).then(data => {
                const newconfig = data.data() as Config
                const res = operationresult.Item as Array<Item>
                res.forEach(item => {
                    newconfig.Qbo[environment].fuelconfig[item.Name].QbId = item.Id
                })
                return t.update(ref, newconfig)
            })
        })
    });
}
