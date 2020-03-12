import { FuelType } from "../fuel/FuelType";

export interface Core {
  date: any;
  /**
   * Separate stat types into Day, Month or Year
   */
  statType: StatType;
  typeValue: number;
  id: string;
  fuelsold: {
    [key in FuelType]: {
      qty: number;
      amount: number;
    };
  };
  orders: {
    discounted: number;
    created: number;
    paid: number;
    deleted: number;
    voided: number;
    exited: number;
    backend: number;
    frontend: number;
  };
  entries: {
    [key in FuelType]: {
      created: number;
    };
  };
  stock: {
    [key in FuelType]: {
      created: number;
      accumulated: number;
    };
  };
}

export type StatType = "D" | "W" | "M" | "Y";

export const emptyCoreStat: Core = {
  date: new Date(),
  typeValue: 0,
  statType: null,
  id: null,
  fuelsold: {
    pms: {
      amount: 0,
      qty: 0
    },
    ago: {
      amount: 0,
      qty: 0
    },
    ik: {
      amount: 0,
      qty: 0
    }
  },
  orders: {
    voided: 0,
    paid: 0,
    exited: 0,
    discounted: 0,
    deleted: 0,
    created: 0,
    backend: 0,
    frontend: 0
  },
  stock: {
    pms: {
      accumulated: 0,
      created: 0
    },
    ago: {
      accumulated: 0,
      created: 0
    },
    ik: {
      accumulated: 0,
      created: 0
    }
  },
  entries: {
    pms: {
      created: 0
    },
    ago: {
      created: 0
    },
    ik: {
      created: 0
    }
  }
};
