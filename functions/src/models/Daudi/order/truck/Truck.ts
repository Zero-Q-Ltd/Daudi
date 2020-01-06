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
  compartmentCount: number;
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
  compartmentCount: null,
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
