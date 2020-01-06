import { GenericStageDetail } from "../GenericStageDetail";
import { GenericTruckStage, TruckStageWithPrinting } from "./StageWithPrinting";
import { Expiry } from "./Truck";

export enum TruckStages {
    "Created",
    "Processing",
    "Queued",
    "Loaded",
    "Complete",
}

export const TruckStageIds = Object.keys(TruckStages).filter(key => isNaN(Number(TruckStages[key])));
export const TruckStageNames = Object.keys(TruckStages).filter(key => !isNaN(Number(TruckStages[key])));

export interface Stage0Model extends GenericStageDetail {
    expiry: Array<Expiry>;
}
export type Stage1Model = TruckStageWithPrinting;
export type Stage2Model = GenericTruckStage;
export type Stage3Model = TruckStageWithPrinting;
