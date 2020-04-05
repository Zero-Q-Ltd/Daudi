import {FuelType} from "../Daudi/fuel/FuelType";
import {FuelConfig} from "../Daudi/omc/FuelConfig";
import {TaxConfig} from "../Daudi/omc/TaxConfig";
import {QBOAuthCOnfig} from "./QboAuthConfig";

export interface QboEnvironment {
  auth: QBOAuthCOnfig;
  fuelconfig: {
    [key in FuelType]: FuelConfig;
  };
  taxConfig: TaxConfig;
}
