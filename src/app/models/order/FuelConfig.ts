import { Batch } from "./Truck";
import { PriceConfig } from "./PriceConfig";
export interface FuelConfig {
    QbId: string;
    qty: number;
    priceconfig: PriceConfig;
    batches: Array<Batch>;
}
