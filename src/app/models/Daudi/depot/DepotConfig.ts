import { fuelTypes } from "../fuel/fuelTypes";
import { DepotPrice } from "./DepotPrice";
export interface DepotConfig {
    CompanyRep: {
        phone: null;
        name: null;
    };
    price: {
        [key in fuelTypes]: DepotPrice;
    };
    hospitality: {
        amnt: number;
    };
}
