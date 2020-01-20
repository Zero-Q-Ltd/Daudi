import {FuelType} from "../Daudi/fuel/FuelType";
import {FuelConfig} from "../Daudi/omc/FuelConfig";
import {QBOAuthCOnfig} from "./QboAuthConfig";
import {TaxConfig} from "../Daudi/omc/TaxConfig";

export interface QboEnvironment {
    auth: QBOAuthCOnfig;
    fuelconfig: {
        [key in FuelType]: FuelConfig;
    };
    taxConfig: TaxConfig;
}
