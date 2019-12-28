import { MyTimestamp } from "../../firestore/firestoreTypes";
import { FuelType } from "./FuelType";
import { StockQty } from "./StockQty";
import { ASEStockQty } from "./ASEStockQty";
import { QbRef } from "./QbRef";

export interface ASE {

    Amount: number;
    date: MyTimestamp;
    ase: {
        id: string,
        refs: QbRef[]
    };
    depot: {
        name: string
        Id: string
    };
    qty: ASEStockQty;

    fuelType: FuelType;
    price: number;
    Id: string;
    active: boolean;
}
export const emptyASEs: ASE = {
    Id: null,
    fuelType: null,
    Amount: null,
    ase: null,
    price: 0,
    qty: {
        total: 0,
        directLoad: {
            total: 0,
            accumulated: {
                total: 0,
                usable: 0
            }
        },
        transfered: {
            total: 0,
            transfers: []
        }
    },

    depot: {
        name: null,
        Id: null
    },
    active: false,
    date: new MyTimestamp(0, 0)
};
