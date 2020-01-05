import { MyTimestamp } from "../../firestore/firestoreTypes";
import { FuelType } from "./FuelType";
import { StockQty, EmptyStockQty } from "./StockQty";
import { QbRef } from "./QbRef";
import { deepCopy } from "../../../models/utils/deepCopy";
import { BaseStockModel } from "./BaseStockModel";
import { EntryRef } from "./StockRef";

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
