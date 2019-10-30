import { Types } from "../fuel/fuelTypes";
import { DepotPrice } from "./DepotPrice";
export interface DepotConfig {
    ContactPerson: {
        phone: null;
        name: null;
    };
    price: {
        [key in Types]: DepotPrice;
    };
    hospitality: {
        amnt: number;
    };
}
