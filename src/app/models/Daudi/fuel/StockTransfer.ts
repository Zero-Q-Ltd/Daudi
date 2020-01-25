import { StockQty } from './StockQty';

export interface StockTransfer {
  total: number;
  transfers: { depotId: string; entryId: string, qty: number }[];
}
