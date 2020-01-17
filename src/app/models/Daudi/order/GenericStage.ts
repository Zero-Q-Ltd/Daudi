import { AssociatedUser, EmptyAssociatedUser } from "../admin/AssociatedUser";
import { Expiry } from "./truck/Truck";
import { deepCopy } from "../../utils/deepCopy";

/**
 * @description Base model for every Stage movement carried out via the web-App
 */
export interface GenericStage {
    user: AssociatedUser;
}
export interface GenericTruckStage extends GenericStage {
    expiry: Expiry[];
}

export const EmptyGenericStage: GenericStage = {
    user: deepCopy(EmptyAssociatedUser)
};

export const EmptyGenericTruckStage: GenericTruckStage = {
    expiry: [],
    user: deepCopy(EmptyAssociatedUser)
};
