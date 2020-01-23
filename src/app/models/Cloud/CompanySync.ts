import {BaseCloudCall} from './BaseCloudCall';
import {SyncRequest} from './Sync';

export interface CompanySync extends BaseCloudCall {
  sync: SyncRequest;
}


