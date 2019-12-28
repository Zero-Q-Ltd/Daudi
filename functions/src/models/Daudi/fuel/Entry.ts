
import { FuelType } from "./FuelType";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { StockQty } from "./StockQty";


export interface Entry {

  Amount: number;
  date: MyTimestamp;
  entry: string;
  depot: {
    name: string
    Id: string
  };
  qty: StockQty;
  QbId: string;
  fuelType: FuelType;
  price: number;
  Id: string;
  active: boolean; // 1 for active, 0 for inactive
}

export interface StockTransfer {
  total: number;
  transfers: StockQty[];
}

export const emptyEntries: Entry = {
  Id: null,
  fuelType: null,
  QbId: null,
  Amount: null,
  entry: null,
  price: 0,
  qty: {
    total: 0,
    directLoad: {
      total: 0
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
