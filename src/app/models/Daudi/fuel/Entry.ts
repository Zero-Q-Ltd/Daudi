
import { FuelType } from "./FuelType";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { StockQty } from "./StockQty";
import { QbRef } from "./QbRef";


export interface Entry {

  Amount: number;
  date: MyTimestamp;
  entry: {
    id: string,
    refs: QbRef[]
  };
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

export const emptyEntries: Entry = {
  Id: null,
  fuelType: null,
  Amount: null,
  entry: null,
  price: 0,
  qty: {
    total: 0,
    directLoad: {
      total: 0
    },
    transferred: {
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
