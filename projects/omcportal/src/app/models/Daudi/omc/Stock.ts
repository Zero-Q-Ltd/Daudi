import { deepCopy } from "app/models/utils/deepCopy";
import { FuelType } from "../fuel/FuelType";
import { emptytaxExempt, TaxExempt } from "./TaxExempt";

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
  };
}
