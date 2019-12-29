import { StockTransfer } from "./StockTransfer";
import { ASELoadDetail } from "./ASELoadDetail";
export interface ASEStockQty {
    /**
     * The total quantity that has been loaded directly at
     * any KPC Depot
     */
    total: number;
    /**
     * Quantity transferred to private depots
     */
    transfered: StockTransfer;
    /**
     * Qty loaded directly at KPC
     */
    directLoad: ASELoadDetail;
}
