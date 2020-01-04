import { Environment } from "../Daudi/omc/Environments";
import { OMC } from "../Daudi/omc/OMC";
import { OMCConfig } from "../Daudi/omc/Config";
import { SyncRequest } from "./Sync";
import { BaseCloudCall } from "./BaseCloudCall";
export interface CompanySync extends BaseCloudCall {
    sync: SyncRequest;
}


