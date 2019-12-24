
import { FuelType } from "./FuelType";
import { MyTimestamp } from "../../firestore/firestoreTypes";


export interface Entry {

  Amount: number;
  date: MyTimestamp;
  entry: string;
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

export const emptybatches: Entry = {
  Id: null,
  fuelType: null,
  QbId: null,
  Amount: null,
  entry: null,
  price: 0,
  qty: {
    total: 0,
    directLoad: {
      accumulated: {
        total: 0,
        usable: 0
      },
      total: 0
    },
    transfered: 0,

  },

  depot: {
    name: null,
    Id: null
  },
  active: false,
  date: new MyTimestamp(0, 0)
};
