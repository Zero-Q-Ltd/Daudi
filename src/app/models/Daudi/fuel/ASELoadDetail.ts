import { StockLoadDetail } from "./StockLoadDetail";
export interface ASELoadDetail extends StockLoadDetail {
    /**
     * ASE quantities accumulate over time as a result of Observed vs Actual Quantities when loading at the depot
     */
    accumulated: {
        total: number;
        usable: number;
    };
}
