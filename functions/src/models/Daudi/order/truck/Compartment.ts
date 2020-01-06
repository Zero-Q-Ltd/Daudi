import {FuelType} from "../../fuel/FuelType";

export interface Compartment {
    position: number;
    fueltype: FuelType;
    qty: number;
}
