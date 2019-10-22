import { firestore } from "firebase-admin";
import { fuelTypes } from "../common";

export interface Batch_ {
  Amount: number;
  date: firestore.Timestamp;
  batch: string;
  depot: {
    name: string;
    Id: string;
  };
  qty: number;
  type: fuelTypes;
  accumulated: {
    total: number;
    usable: number;
  };
  loadedqty: number;
  runningcost: number;
  price: number;
  Id: string;
  status: number; //1 for active, 0 for inactive
}

export const emptybatches: Batch_ = {
  Id: "",
  type: 'pms',
  Amount: 0,
  batch: "",
  price: 0,
  qty: 0,
  loadedqty: 0,
  accumulated: {
    total: 0,
    usable: 0
  },
  runningcost: 0,
  depot: {
    name: "",
    Id: ""
  },
  status: 1,
  date: firestore.Timestamp.fromDate(new Date())
};
