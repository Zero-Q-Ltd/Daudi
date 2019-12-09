import { QbTypes } from "../QbTypes";
import { MyTimestamp } from "../firestore/firestoreTypes";


export interface SyncRequest {
  synctype: Array<QbTypes>;
  companyid: number;
  time: MyTimestamp;
}
