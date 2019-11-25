import { QbTypes } from "../QbTypes";
import * as firebase from "firebase";
import Timestamp = firebase.firestore.Timestamp;

export interface SyncRequest {
  synctype: Array<QbTypes>;
  companyid: number;
  time: Timestamp;
}
