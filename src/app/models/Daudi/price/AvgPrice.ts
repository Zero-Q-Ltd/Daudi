import {FuelType} from "../fuel/FuelType";
import {AssociatedUser, EmptyAssociatedUser} from "../admin/AssociatedUser";
import {deepCopy} from "../../utils/deepCopy";

export interface AvgPrice {
    Id: string;
    price: number;
    user: AssociatedUser;
    fueltytype: FuelType;
    omcId?: string;
}

export const emptyprice: AvgPrice = Object.freeze({
    price: null,
    Id: null,
    user: deepCopy<AssociatedUser>(EmptyAssociatedUser),
    fueltytype: null
});
