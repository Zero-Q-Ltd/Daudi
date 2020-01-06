import {StockQty} from "./StockQty";

export interface StockTransfer {
    total: number;
    transfers: StockQty[];
}
