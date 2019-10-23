import * as firebase from "firebase";

export interface Batch {

  Amount: number;
  date: firebase.firestore.Timestamp | Date;
  batch: string;
  depot: {
    name: string
    Id: string
  };
  qty: number;
  type: string;
  accumulated: {
    total: number,
    usable: number
  };
  loadedqty: number;
  runningcost: number;
  price: number;
  Id: string;
  status: number; // 1 for active, 0 for inactive
}

export const emptybatches: Batch = {
  Id: null,
  type: null,
  Amount: null,
  batch: null,
  price: 0,
  qty: null,
  loadedqty: 0,
  accumulated: {
    total: 0,
    usable: 0
  },
  runningcost: null,
  depot: {
    name: null,
    Id: null
  },
  status: 1,
  date: new firebase.firestore.Timestamp(0, 0)
};
