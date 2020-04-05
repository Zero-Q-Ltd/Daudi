import {MyTimestamp} from "../firestore/firestoreTypes";
import {QbTypes} from "../QbTypes";

export interface SyncRequest {
  synctype: QbTypes[];
  time: MyTimestamp;
}
