import { FuelType } from "../fuel/FuelType";
import { FuelConfig } from "./FuelConfig";
import { QBOAuthCOnfig } from "./QboAuthConfig";
import { TaxConfig } from "./TaxConfig";
export interface QboEnvironment {
    auth: QBOAuthCOnfig;
    fuelconfig: {
        [key in FuelType]: FuelConfig;
    };
    taxConfig: TaxConfig;
}
