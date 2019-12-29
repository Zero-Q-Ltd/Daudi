import { StockTransfer } from "./StockTransfer";
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
    transferred: StockTransfer;
    /**
     * Qty loaded directly at KPC
     */
    directLoad: StockLoadDetail;
}

