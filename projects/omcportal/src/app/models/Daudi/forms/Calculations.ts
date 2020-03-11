import {FuelType} from '../fuel/FuelType';

export type Calculations = {
  [key in FuelType]: FuelCalculation
};

export interface FuelCalculation {
  price: number;
  qty: number;
}
