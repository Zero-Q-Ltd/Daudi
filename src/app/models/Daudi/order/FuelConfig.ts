import {TruckEntry} from "./truck/Truck";
import {PriceConfig} from "./PriceConfig";

export interface OrderFuelConfig {
    qty: number;
    priceconfig: PriceConfig;
    entries: Array<TruckEntry>;
}
