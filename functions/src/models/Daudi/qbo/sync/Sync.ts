import { QbTypes } from "../QbTypes";
import { firestore } from "firebase-admin";

export interface SyncRequest {
  synctype: Array<QbTypes>;
  companyid: number;
  time: firestore.Timestamp;
}
