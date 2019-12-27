import { AssociatedUser, inituser } from "../admin/AssociatedUser";
import { TruckStages } from "./TruckStages";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { FuelType } from "./../../Daudi/fuel/FuelType";
import { deepCopy } from "./../../utils/deepCopy";


interface Compartment {
  position: number;
  fueltype: FuelType;
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
    timestamp: MyTimestamp | Date;
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
export const emptyTruckStageData: StageData = {
  expiry: [],
  user: deepCopy<AssociatedUser>(inituser),
  print: null,
  seals: null
};
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
  stagedata: {
    0: deepCopy<StageData>(emptyTruckStageData),
    1: deepCopy<StageData>(emptyTruckStageData),
    2: deepCopy<StageData>(emptyTruckStageData),
    3: deepCopy<StageData>(emptyTruckStageData),
    4: deepCopy<StageData>(emptyTruckStageData),
  },
  compartments: []
};
