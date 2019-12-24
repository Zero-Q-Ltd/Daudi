import { MyTimestamp } from "../../firestore/firestoreTypes";
import { FuelType } from "./FuelType";
import { StockQty } from "./StockQty";

export interface ASE {

    Amount: number;
    date: MyTimestamp;
    ase: string;
    depot: {
        name: string
        Id: string
    };
    qty: StockQty;

    QbId: string;
    // vessel:{

    // }
    fuelType: FuelType;
    price: number;
    Id: string;
    active: boolean; // 1 for active, 0 for inactive
}
