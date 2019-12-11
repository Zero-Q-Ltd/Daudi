import { Batch } from "./Truck";
import { PriceConfig } from "./PriceConfig";
export interface OrderFuelConfig {
    qty: number;
    priceconfig: PriceConfig;
    batches: Array<Batch>;
}
