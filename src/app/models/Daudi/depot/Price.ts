import { FuelType } from "../fuel/FuelType";
import { AssociatedUser, inituser } from "../admin/AssociatedUser";


export interface Price {
  Id: string;
  price: number;
  user: AssociatedUser;
  fueltytype: FuelType;
}

export const emptyprice: Price = {
  price: null,
  Id: null,
  user: { ...inituser },
  fueltytype: null
};
