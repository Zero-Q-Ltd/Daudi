import { FuelType } from '../fuel/FuelType';
import { TaxExempt, emptytaxExempt } from './TaxExempt';
import { deepCopy } from '../../../../../functions/src/models/utils/deepCopy';

export interface Stock {
  qty: {

    [key in FuelType]: {
      allocation: number;
      /**
       * Total amount of ASE in KPC depots
       */
      ase: number
    }
  };
  taxExempt: {
    [subKey in FuelType]: TaxExempt
  };
}

export const EmptyOMCStock: Stock = {
  qty: {
    ago: {
      allocation: 0,
      ase: 0
    },
    ik: {
      allocation: 0,
      ase: 0
    },
    pms: {
      allocation: 0,
      ase: 0
    }
  },
  taxExempt: {
    ago: deepCopy<TaxExempt>(emptytaxExempt),
    ik: deepCopy<TaxExempt>(emptytaxExempt),
    pms: deepCopy<TaxExempt>(emptytaxExempt)
  },
};
export function newStock(): Stock {
  return {
    ...{
      qty: {
        ago: {
          allocation: 0,
          ase: 0
        },
        ik: {
          allocation: 0,
          ase: 0
        },
        pms: {
          allocation: 0,
          ase: 0
        }
      },
    },
    taxExempt: {
      ago: deepCopy<TaxExempt>(emptytaxExempt),
      ik: deepCopy<TaxExempt>(emptytaxExempt),
      pms: deepCopy<TaxExempt>(emptytaxExempt)
    },
  }
}
