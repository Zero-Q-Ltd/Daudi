import { StockTransfer } from "./Entry";
import { StockLoadDetail } from "./StockLoadDetail";
export interface StockQty {
    /**
     * The total quantity that has been loaded directly at
     * any KPC Depot
     */
    total: number;
    /**
     * Quantity transferred to private depots
     */
    transfered?: StockTransfer;
    /**
     * Qty loaded directly at KPC
     */
    directLoad: StockLoadDetail;
}

