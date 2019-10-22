import { fuelTypes } from "../common";
import { OrderAction } from "../Cloud/OrderAction";

export interface Stat {
  date: any;
  id: string;
  fuelsold?: {
    [key in fuelTypes]: {
      qty: number;
      amount: number;
    };
  };
  orders?: {
    [key in OrderAction]: number;
  };
  batches?: {
    [key in fuelTypes]: {
      created: number;
      accumulated: number;
    };
  };
  customers?: {
    new: number;
  };
}

export const emptystat: Stat = {
  date: new Date(),
  id: "",
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
    deleted: 0,
    created: 0,
    completed: 0
  },
  batches: {
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
  customers: {
    new: 0
  }
};
