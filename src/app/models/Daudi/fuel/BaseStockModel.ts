
import { FuelType } from "./FuelType";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { StockQty, EmptyStockQty } from "./StockQty";
import { deepCopy } from "../../../models/utils/deepCopy";


export interface BaseStockModel {
    Amount: number;
    date: MyTimestamp;
    depot: {
        name: string
        Id: string
    };
    qty: StockQty;
    fuelType: FuelType;
    price: number;
    Id: string;
    active: boolean; // 1 for active, 0 for inactive
}
export const EmptyBaseStockModel: BaseStockModel = {
    Id: null,
    fuelType: null,
    Amount: null,
    price: 0,
    qty: deepCopy<StockQty>(EmptyStockQty),
    depot: {
        name: null,
        Id: null
    },
    active: false,
    date: new MyTimestamp(0, 0)
};