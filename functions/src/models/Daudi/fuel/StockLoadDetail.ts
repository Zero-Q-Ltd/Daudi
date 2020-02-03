export interface StockLoadDetail {
  /**
   * Total qty that has been loaded
   */
  total: number;
  /**
   * quantities accumulate over time as a result of Observed vs Actual Quantities when loading at the depot
   */
  accumulated: {
    total: number;
    usable: number;
  };
}

