import { QbTypes } from "../QbTypes";

export interface SyncRequest {
  synctype: Array<QbTypes>;
  companyid: number;
  time: Timestamp;
}
