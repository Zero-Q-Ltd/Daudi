import { firestore } from "firebase";
import { QbTypes } from "../QbTypes";

export interface SyncRequest {
  synctype: Array<QbTypes>;
  companyid: number;
  time: firestore.Timestamp;
}
