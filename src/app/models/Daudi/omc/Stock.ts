import { deepCopy } from '../../utils/deepCopy';
import { FuelType } from '../fuel/FuelType';
import { emptytaxExempt, TaxExempt } from './TaxExempt';

export interface OMCStock {
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

export const EmptyOMCStock: OMCStock = {
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
