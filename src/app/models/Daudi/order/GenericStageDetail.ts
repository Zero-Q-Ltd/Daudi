import { deepCopy } from "../../utils/deepCopy";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";
import { Expiry } from "./truck/Truck";
export interface GenericStageDetail {
    user: AssociatedUser;
}
export const EmptyGenericDetail: GenericStageDetail = {
    user: deepCopy<AssociatedUser>(inituser),
};
