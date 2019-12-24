import { StockLoadDetail } from "./StockLoadDetail";
export interface ASELoadDetail extends StockLoadDetail {
    /**
     * Accumulated amounts
     */
    accumulated: {
        total: number;
        usable: number;
    };
}
