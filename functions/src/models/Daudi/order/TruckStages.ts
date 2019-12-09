export type TruckStages = "0" | "1" | "2" | "3" | "4" | "5";

export enum _TruckStages {
    "Estimates",
    "Invoiced",
    "Paid",
    "Loading Orders",
    "Complete",
    "Deleted",
}

export const TruckStageIds = Object.keys(_TruckStages).filter(key => isNaN(Number(_TruckStages[key])));
export const TruckStageNames = Object.keys(_TruckStages).filter(key => !isNaN(Number(_TruckStages[key])));
