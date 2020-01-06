import { deepCopy } from "../../../models/utils/deepCopy";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { BaseStockModel } from "./BaseStockModel";
import { QbRef } from "./QbRef";
import { EmptyStockQty, StockQty } from "./StockQty";
import { Environment } from "../omc/Environments";

export interface ASE extends BaseStockModel {
    ase: QbRef;
}

export const emptyASEs: ASE = {
    Id: null,
    fuelType: null,
    Amount: null,
    ase: {
        QbId: null,
        qty: 0
    },
    price: 0,
    qty: deepCopy<StockQty>(EmptyStockQty),
    depot: {
        name: null,
        Id: null
    },
    active: false,
    date: new MyTimestamp(0, 0)
};
