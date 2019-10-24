import { fuelTypes, inituser, User } from "./universal";
import * as firebase from "firebase";

const initbatch = {
  Id: null,
  Name: null,
  observed: null,
  qty: null
};

interface Compartment {
  fueltype: string;
  qty: number;
}

interface Expiries {
  time: string;
  timestamp: firebase.firestore.Timestamp | Date;
}

export interface Batch {
  Name: string;
  Id: string;
  qty: number;
  observed: number;
}

export interface Truck {
  stage: number;
  Id: string;

  frozen: boolean;

  driverdetail: {
    name: string,
    id: string,
    phone: string
  };
  truckdetail: {
    numberplate: string;
  };

  stagedata: Array<StageData>;
  compartments: Array<Compartment>;
}
export interface StageData {
  user: User;
  /**
   * This data only exists for stages that have print functionality
   */
  print?: {
    status: boolean,
    timestamp: firebase.firestore.Timestamp | Date;
  };
  expiry: Array<Expiries>;
  /**
   * only the last stage has seals
   */
  seals?: {
    range: string,
    broken: Array<string>
  };
}

export const emptytruck: Truck = {
  stage: null,
  Id: null,


  frozen: false,
  driverdetail: {
    id: null,
    name: null,
  },
  truckdetail: {
    numberplate: null
  },
  stagedata: [],
  compartments: [
    { fueltype: null, qty: 0 }, { fueltype: null, qty: 0 },
    { fueltype: null, qty: 0 }, { fueltype: null, qty: 0 },
    { fueltype: null, qty: 0 }, { fueltype: null, qty: 0 },
    { fueltype: null, qty: 0 }]
};

export type truckStages = "0" | "1" | "2" | "3" | "4";
export let truckStagesarray = ["0", "1", "2", "3", "4"];
export let truckqueryStagesarray = ["1", "2", "3"];
