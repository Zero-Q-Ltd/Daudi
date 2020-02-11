import { deepCopy } from '../../utils/deepCopy';
import { FuelType } from '../fuel/FuelType';
import { emptytaxExempt, TaxExempt } from './TaxExempt';

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
    }
  }
}
