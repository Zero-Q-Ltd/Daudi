import { inituser } from "../universal/universal";
import { Types } from "../fuel/fuelTypes";
import { User } from "../universal/User";
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

interface Expiry {
  timeCreated: firebase.firestore.Timestamp;
  expiry: firebase.firestore.Timestamp;
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
  compartmentCount: number;
  driverdetail: {
    name: string,
    id: string,
    phone: string
  };
  truckdetail: {
    numberplate: string;
  };
  /**
   * This design allows complex queries on the map, as opposed to the limitations of an array
   */
  stagedata: {
    [key in truckStages]: StageData
  };
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
  expiry: Array<Expiry>;
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
  compartmentCount: null,
  frozen: false,
  driverdetail: {
    id: null,
    name: null,
    phone: null
  },
  truckdetail: {
    numberplate: null
  },
  stagedata: null,
  compartments: []
};

export type truckStages = "0" | "1" | "2" | "3" | "4" | "5";
export let truckStagesarray = ["0", "1", "2", "3", "4", "5"];
