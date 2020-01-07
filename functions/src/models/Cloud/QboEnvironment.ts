import { FuelType } from "../Daudi/fuel/FuelType";
import { FuelConfig, emptyFuelConfig } from "../Daudi/omc/FuelConfig";
import { QBOAuthCOnfig } from "./QboAuthConfig";
import { TaxConfig } from "../Daudi/omc/TaxConfig";
import { deepCopy } from "../utils/deepCopy";
import { emptyqboAuth } from "../Daudi/omc/Config";

export interface QboCofig {
    auth: QBOAuthCOnfig;
    fuelconfig: {
        [key in FuelType]: FuelConfig;
    };
    taxConfig: TaxConfig;
}

export const EmptyQboConfig: QboCofig = {
    auth: deepCopy<QBOAuthCOnfig>(emptyqboAuth),
    fuelconfig: {
        pms: deepCopy<FuelConfig>(emptyFuelConfig),
        ago: deepCopy<FuelConfig>(emptyFuelConfig),
        ik: deepCopy<FuelConfig>(emptyFuelConfig)
    },
    taxConfig: {
        taxAgency: {
            Id: "0"
        },
        taxCode: {
            Id: "0"
        },
        taxRate: {
            Id: "0"
        },
    }
}