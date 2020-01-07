import { MyTimestamp } from "../../../firestore/firestoreTypes";
import { Compartment } from "./Compartment";


export interface Expiry {
  timeCreated: MyTimestamp;
  expiry: MyTimestamp;
}

export interface TruckEntry {
  Name: string;
  Id: string;
  qty: number;
  observed: number;
}

export interface Truck {
  stage: number;
  compartmentCount: number;
  hasBeenReset: boolean;
  driverdetail: {
    name: string,
    id: string,
    phone: string
  };
  truckdetail: {
    numberplate: string;
  };
  compartments: Array<Compartment>;
}

export const emptytruck: Truck = {
  stage: null,
  compartmentCount: null,
  hasBeenReset: false,
  driverdetail: {
    id: null,
    name: null,
    phone: null
  },
  truckdetail: {
    numberplate: null
  },
  compartments: []
};
