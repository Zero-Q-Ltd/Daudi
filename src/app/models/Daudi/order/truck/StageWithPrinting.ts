import {MyTimestamp} from "../../../firestore/firestoreTypes";
import {GenericStageDetail} from "../GenericStageDetail";
import {Expiry} from "./Truck";
import {deepCopy} from "../../../utils/deepCopy";
import {AssociatedUser, inituser} from "../../admin/AssociatedUser";

export interface TruckStageWithPrinting extends GenericTruckStage {
    print: {
        status: boolean;
        timestamp: MyTimestamp | Date;
    };
}
export interface GenericTruckStage extends GenericStageDetail {
    expiry: Array<Expiry>;
}

export const EmptyStageWithPrinting: TruckStageWithPrinting = {
    print: {
        status: false,
        timestamp: null
    },
    expiry: [],
    user: deepCopy<AssociatedUser>(inituser)
};
