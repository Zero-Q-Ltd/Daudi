import { AssociatedUser } from "../admin/AssociatedUser";
import { TruckStages } from "./TruckStages";
import { MyTimestamp } from "../../firestore/firestoreTypes";


interface Compartment {
  fueltype: string;
  qty: number;
}

interface Expiry {
  timeCreated: MyTimestamp;
  expiry: MyTimestamp;
}

export interface Batch {
  Name: string;
  Id: string;
  qty: number;
  observed: number;
}

export interface Truck {
  stage: number;
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
    [key in TruckStages]: StageData
  };
  compartments: Array<Compartment>;
}
export interface StageData {
  user: AssociatedUser;
  /**
   * This data only exists for stages that have print functionality
   */
  print?: {
    status: boolean,
    MyTimestamp: MyTimestamp | Date;
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

export let truckStagesarray = ["0", "1", "2", "3", "4", "5"];
