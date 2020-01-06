import {MyTimestamp} from "../../../firestore/firestoreTypes";
import {Compartment} from "./Compartment";
import {TruckStages} from "./TruckStages";


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
  stagedata: {
    [stage in TruckStages]: OrderStage<stage>
  };
  compartments: Array<Compartment>;
}
type OrderStage<stage> = (key: number) => {
  return: Truck;
};
export const emptytruck: Truck = {
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
