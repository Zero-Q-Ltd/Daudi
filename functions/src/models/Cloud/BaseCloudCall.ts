import { Environment } from "../Daudi/omc/Environments";
import { OMC } from "../Daudi/omc/OMC";
import { OMCConfig } from "../Daudi/omc/Config";
export interface BaseCloudCall {
    omc: OMC;
    config: OMCConfig;
    environment: Environment;
}
