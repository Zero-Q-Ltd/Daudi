import { firestore } from 'firebase';
;
import { QbTypes } from "../common";

export interface SyncRequest {
  synctype: Array<QbTypes>;
  companyid: number;
  time: firestore.Timestamp;
}
