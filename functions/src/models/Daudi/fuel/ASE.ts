import { MyTimestamp } from "../../firestore/firestoreTypes";
import { FuelType } from "./FuelType";

export interface ASE {

    Amount: number;
    date: MyTimestamp;
    ase: string;
    depot: {
        name: string
        Id: string
    };
    qty: {
        /**
         * The total quantity that has been loaded directly at
         * any KPC Depot
         */
        total: number;
        directLoad: {
            total: number,
            accumulated: {
                total: number,
                usable: number
            };
        },
        /**
         * Total transfered to a private depot WITH ASE's
         */
        transfered: number

    };
    QbId: string;
    // vessel:{

    // }
    fuelType: FuelType;
    price: number;
    Id: string;
    active: boolean; // 1 for active, 0 for inactive
}