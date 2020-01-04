import { AssociatedUser, inituser } from "../admin/AssociatedUser";
import { TruckStages, Stage0Model, Stage1Model, Stage2Model, Stage3Model, Stage4Model, EmptyStage0, EmptyStage1, EmptyStage2, EmptyStage3, EmptyStage4 } from "./TruckStages";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { FuelType } from "./../../Daudi/fuel/FuelType";
import { deepCopy } from "./../../utils/deepCopy";
import { GenericStageDetail } from "./GenericStageDetail";


interface Compartment {
  position: number;
  fueltype: FuelType;
  qty: number;
}

export interface Expiry {
  timeCreated: MyTimestamp;
  expiry: MyTimestamp;
}

export interface Entry {
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
    [key in TruckStages]: TruckStageData;
  };
  compartments: Array<Compartment>;
}
export type TruckStageData = Stage0Model | Stage1Model | Stage2Model | Stage3Model | Stage4Model;
export const emptyTruckStageData: TruckStageData = {
  expiry: [],
  user: deepCopy<AssociatedUser>(inituser),
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
    0: deepCopy<Stage0Model>(EmptyStage0),
    1: deepCopy<Stage1Model>(EmptyStage1),
    2: deepCopy<Stage2Model>(EmptyStage2),
    3: deepCopy<Stage3Model>(EmptyStage3),
    4: deepCopy<Stage4Model>(EmptyStage4),
  },
  compartments: []
};
