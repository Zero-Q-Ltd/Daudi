import { MyTimestamp } from "../../../firestore/firestoreTypes";
import { AssociatedUser } from "../../admin/AssociatedUser";
import { Compartment } from "./Compartment";
import { TruckStages } from "./TruckStages";

export interface Expiry {
  timeCreated: Date;
  expiry: Date;
  user: AssociatedUser;
}

export interface TruckEntry {
  name: string;
  id: string;
  qty: number;
  observed: number;
}

export interface Truck {
  stage: (typeof TruckStages)[keyof typeof TruckStages];
  compartmentCount: number;
  hasBeenReset: boolean;
  driverdetail: {
    name: string,
    id: string,
    phone: string;
  };
  truckdetail: {
    numberplate: string;
  };
  compartments: Compartment[];
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
