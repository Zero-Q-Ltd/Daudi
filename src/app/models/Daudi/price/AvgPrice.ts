import { FuelType } from "../fuel/FuelType";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";

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
  user: { ...inituser },
  fueltytype: null
});
