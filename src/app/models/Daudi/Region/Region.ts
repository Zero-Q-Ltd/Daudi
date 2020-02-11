import { FuelType } from "../../../../../functions/src/models/Daudi/fuel/FuelType";

import { emptytaxExempt, TaxExempt } from '../../../../../functions/src/models/Daudi/omc/TaxExempt';
import { deepCopy } from '../../../../../functions/src/models/utils/deepCopy';

export interface Region {
    taxExempt: {
        [subKey in FuelType]: TaxExempt
    };
}

export function newRegion(): Region {
    return {
        ...{
            taxExempt: {
                ago: deepCopy<TaxExempt>(emptytaxExempt),
                ik: deepCopy<TaxExempt>(emptytaxExempt),
                pms: deepCopy<TaxExempt>(emptytaxExempt)
            },
        }
    };
}
