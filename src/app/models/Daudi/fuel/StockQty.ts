
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
  transferred: {
    total: number;
    transfers: { depotId: string; entryId: string, qty: number }[];
  };
  /**
   * Qty loaded(drawn) directly at a depot
   */
  directLoad: {
    /**
     * Total qty that has been loaded
     */
    total: number;
    /**
     * quantities accumulate over time as a result of Observed vs Actual Quantities when loading at the depot
     */
    accumulated: number;
  }
}

export const EmptyStockQty: StockQty = {
  total: 0,
  used: 0,
  directLoad: {
    total: 0,
    accumulated: 0
  },
  transferred: {
    total: 0,
    transfers: []
  },
};
