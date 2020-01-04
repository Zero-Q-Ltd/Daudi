import { Environment } from '../Daudi/omc/Environments';
import { OMC } from '../Daudi/omc/OMC';
import { OMCConfig } from '../Daudi/omc/Config';
import { SyncRequest } from './Sync';
export interface CompanySync {
    omc: OMC;
    config: OMCConfig;
    environment: Environment;
    sync: SyncRequest;
}

