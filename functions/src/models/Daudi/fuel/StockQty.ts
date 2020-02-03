import {StockLoadDetail} from './StockLoadDetail';
import {StockTransfer} from './StockTransfer';

export interface StockQty {
  /**
   * The total quantity that was been loaded directly at
   * any KPC Depot
   */
  total: number;
  /**
   * The total that has been loaded, excluding amounts accumulated
   */
  used: number;
  /**
   * Quantity transferred to private depots
   */
  transferred: StockTransfer;
  /**
   * Qty loaded directly at KPC
   */
  directLoad: StockLoadDetail;
}

export const EmptyStockQty: StockQty = {
  total: 0,
  used: 0,
  directLoad: {
    total: 0,
    accumulated: {
      total: 0,
      usable: 0
    }
  },
  transferred: {
    total: 0,
    transfers: []
  },
};
