import { GenericStageDetail, EmptyGenericDetail } from "./GenericStageDetail";
import { StageWithPrinting, EmptyStageWithPrinting } from "./StageWithPrinting";
import { deepCopy } from "./../../utils/deepCopy";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";

export enum TruckStages {
    "Created",
    "Processing",
    "Queued",
    "Loaded",
    "Complete",
}

export const TruckStageIds = Object.keys(TruckStages).filter(key => isNaN(Number(TruckStages[key])));
export const TruckStageNames = Object.keys(TruckStages).filter(key => !isNaN(Number(TruckStages[key])));

export type Stage0Model = GenericStageDetail;
export type Stage1Model = StageWithPrinting;
export type Stage2Model = GenericStageDetail;
export type Stage3Model = StageWithPrinting;
export interface Stage4Model extends GenericStageDetail {
    seals: {
        range: string,
        broken: Array<string>
    };
}

export const EmptyStage4: Stage4Model = {
    expiry: [],
    user: deepCopy<AssociatedUser>(inituser),
    seals: {
        broken: [],
        range: null
    }
};

export const EmptyStage0: Stage0Model = deepCopy<Stage0Model>(EmptyGenericDetail);
export const EmptyStage1: Stage1Model = deepCopy<Stage1Model>(EmptyStageWithPrinting);
export const EmptyStage2: Stage2Model = deepCopy<Stage2Model>(EmptyGenericDetail);
export const EmptyStage3: Stage3Model = deepCopy<Stage3Model>(EmptyStageWithPrinting);
