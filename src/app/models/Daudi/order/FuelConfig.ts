import {PriceConfig} from './PriceConfig';
import {TruckEntry} from './truck/Truck';

export interface OrderFuelConfig {
  qty: number;
  priceconfig: PriceConfig;
  entries: Array<TruckEntry>;
  /**
   * @description Duplicated here to allow querying, as in order to query via the array of objects we would have to provide the whole object
   */
  entryIds: string[];
}
