import { Types } from "../fuel/fuelTypes";
import { User } from "../universal/User";

export interface AvgPrice {
  Id: string;
  price: number;
  user: User;
  fueltytype: Types;
  omcId?: string;
}

export const emptyprice: AvgPrice = Object.freeze({
  price: null,
  Id: null,
  user: {
    name: null,
    time: null,
    uid: null
  },
  fueltytype: null
});
