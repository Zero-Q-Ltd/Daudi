import { OMC } from "../../../../models/Daudi/omc/OMC";
import { Config } from "../../../../models/Daudi/omc/Config";
import { createQbo } from "../../../sharedqb";
import { firestore } from "firebase-admin";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { Item } from "../../../../models/Qbo/Item";
import { fueltypesArray } from "../../../../models/Daudi/fuel/fuelTypes";
import { fuelTypes } from "../../../../models/common";

export function initItems(omc: OMC, config: Config, environment: Environment) {
    /**
     * Simultaneously create the 3 fuel types on initialisation
     */
    const generalfuel: Item = {
        Active: true,
        Name: "pms",
        FullyQualifiedName: "",
        Taxable: true,
        TrackQtyOnHand: true,
        sparse: false,
        UnitPrice: 0,

        SyncToken: "0",
        InvStartDate: firestore.Timestamp.now().toDate().formatUTC("YYYY-MM-DDZ"),
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

    return createQbo(omc.Id, config, environment).then(result => {
        const qbo = result;
        return qbo.createItem(fuelItems).then(operationresult => {
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
            const res = operationresult.Item as Array<Item>
            res.forEach(item => {
                config.Qbo[environment].fuelconfig[item.Name].QbId = item.Id
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
