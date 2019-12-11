import { Environment } from '../Daudi/omc/Environments';
import { OMC } from '../Daudi/omc/OMC';
import { Config } from '../Daudi/omc/Config';
import { SyncRequest } from './Sync';
export interface CompanySync {
    omc: OMC;
    config: Config;
    environment: Environment;
    sync: SyncRequest;
}
