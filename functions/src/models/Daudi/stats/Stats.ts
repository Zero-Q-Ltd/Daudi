import {FuelType} from '../fuel/FuelType';

export interface Stat {
  date: any;
  id: string;
  fuelsold?: {
    [key in FuelType]: {
      qty: number,
      amount: number,
    }
  };
  orders?: {
    discounted?: number
    created?: number,
    paid?: number,
    deleted?: number,
    voided?: number,
    exited?: number,
    backend?: number,
    frontend?: number
  };
  batches?: {
    [key in FuelType]: {
      created: number,
      accumulated: number
    }
  };
  customers?: {
    new: number,
  };

}

export const emptystat: Stat = {
  date: new Date(),
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
