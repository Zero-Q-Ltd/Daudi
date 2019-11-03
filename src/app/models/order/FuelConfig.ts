import { Batch } from "./Truck";
import { PriceConfig } from "./PriceConfig";
export interface FuelConfig {
    QbId: number;
    qty: number;
    priceconfig: PriceConfig;
    batches: Array<Batch>;
}
