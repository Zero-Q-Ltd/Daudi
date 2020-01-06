import { firestore } from "firebase-admin";
import { QuickBooks } from "../../../../libs/qbmain";
import { FuelType } from '../../../../models/Daudi/fuel/FuelType';
import { OMCConfig } from "../../../../models/Daudi/omc/Config";
import { OMC } from "../../../../models/Daudi/omc/OMC";
import { ItemType } from "../../../../models/Qbo/enums/ItemType";
import { Item } from "../../../../models/Qbo/Item";

/**
 * There are 3 fuel types, where every fuel is an ITEM, as far as qbo is concerned
 * @param omc 
 * @param config 
 * @param environment 
 */
export function initFuels(omc: OMC, config: OMCConfig, qbo: QuickBooks) {
    /**
     * Simultaneously create the 3 fuel types on initialisation
     */
    const generalfuel: Item = {
        Active: true,
        Name: FuelType.pms,
        Taxable: true,
        TrackQtyOnHand: true,
        sparse: false,
        UnitPrice: 0,

        SyncToken: "0",
        Type: ItemType.Inventory,
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
    const fuelItems: Array<Item> = Object.keys(FuelType).map(key => {
        const fuel: FuelType = FuelType[key]
        return { ...generalfuel, ...{ Name: fuel } }
    })

    return qbo.createItem(fuelItems[0]).then(operationresult => {
        const ref = firestore()
            .collection("omc")
            .doc(omc.Id)
            .collection("config")
            .doc("main")

        return firestore().runTransaction(t => {
            return t.get(ref).then(data => {
                const newconfig = data.data() as OMCConfig
                const res = operationresult.Item as Array<Item>
                res.forEach(item => {
                    newconfig.Qbo.fuelconfig[item.Name].groupId = item.Id
                })
                return t.update(ref, newconfig)
            })
        })
    });
}
