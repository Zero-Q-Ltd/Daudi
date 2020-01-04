import { MyTimestamp } from "../../firestore/firestoreTypes";
import { GenericStageDetail } from "./GenericStageDetail";
import { Expiry } from "./Truck";
import { deepCopy } from "./../../utils/deepCopy";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";
export interface StageWithPrinting extends GenericStageDetail {
    print: {
        status: boolean;
        timestamp: MyTimestamp | Date;
    };
    expiry: Array<Expiry>;
}

export const EmptyStageWithPrinting: StageWithPrinting = {
    print: {
        status: false,
        timestamp: null
    },
    expiry: [],
    user: deepCopy<AssociatedUser>(inituser)
};