import { Types } from "../fuel/fuelTypes";
import { User } from "../universal/User";

export interface Price {
  Id: string;
  price: number;
  user: User;
  fueltytype: Types;
}

export const emptyprice: Price = {
  price: null,
  Id: null,
  user: {
    name: null,
    time: null,
    uid: null
  },
  fueltytype: null
});
