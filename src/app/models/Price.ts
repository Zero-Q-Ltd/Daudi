import {fuelTypes, User} from "./universal";

export type Price = {
  Id: string,
  price: number,
  user: User,
  fueltytype: fuelTypes,
}

export const emptyprice: Price = Object.freeze({
  price: null,
  Id: null,
  user: {
    name: null,
    time: null,
    uid: null
  },
  fueltytype: null
});
