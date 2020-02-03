import { FuelType } from "../Daudi/fuel/FuelType";
import { FuelConfig, emptyFuelConfig } from "../Daudi/omc/FuelConfig";
import { QBOAuthCOnfig, EmptyQBOAuthCOnfig } from "./QboAuthConfig";
import { TaxConfig } from "../Daudi/omc/TaxConfig";
import { deepCopy } from "../utils/deepCopy";

export interface QboCofig {
    sandbox: boolean,
    auth: QBOAuthCOnfig;
    fuelconfig: {
        [key in FuelType]: FuelConfig;
    };
    taxConfig: TaxConfig;
}

export const EmptyQboConfig: QboCofig = {
    sandbox: true,
    auth: deepCopy<QBOAuthCOnfig>(EmptyQBOAuthCOnfig),
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