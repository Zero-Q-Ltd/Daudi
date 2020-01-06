import { FuelType } from "../fuel/FuelType";
import { AssociatedUser, EmptyAssociatedUser } from "../admin/AssociatedUser";
import { deepCopy } from "../../utils/deepCopy";


export interface Price {
  Id: string;
  price: number;
  user: AssociatedUser;
  fueltytype: FuelType;
  depotId: string;
}

export const emptyprice: Price = {
  price: null,
  Id: null,
  user: deepCopy<AssociatedUser>(EmptyAssociatedUser),
  fueltytype: null,
  depotId: null
};
