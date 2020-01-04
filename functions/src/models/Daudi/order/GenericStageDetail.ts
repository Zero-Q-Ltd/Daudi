import { deepCopy } from "./../../utils/deepCopy";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";
import { Expiry } from "./truck/Truck";
export interface GenericStageDetail {
    user: AssociatedUser;
    expiry: Array<Expiry>;
}
export const EmptyGenericDetail: GenericStageDetail = {
    expiry: [],
    user: deepCopy<AssociatedUser>(inituser),
};
