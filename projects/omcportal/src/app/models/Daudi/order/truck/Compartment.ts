import {FuelType} from "../../fuel/FuelType";

export interface Compartment {
  /**
   * @description sometimes trucker choose to skip some compartments in order to balance the weight
   */
  position: number;
  fueltype: FuelType;
  qty: number;
}
