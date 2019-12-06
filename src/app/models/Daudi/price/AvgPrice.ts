import { fuelTypes } from "../fuel/fuelTypes";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";

export interface AvgPrice {
  Id: string;
  price: number;
  user: AssociatedUser;
  fueltytype: fuelTypes;
  omcId?: string;
}

export const emptyprice: AvgPrice = Object.freeze({
  price: null,
  Id: null,
  user: { ...inituser },
  fueltytype: null
});
