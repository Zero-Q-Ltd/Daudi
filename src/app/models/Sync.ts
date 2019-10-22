import {QbTypes} from "./universal";
import * as firebase from "firebase";
import Timestamp = firebase.firestore.Timestamp;

export interface syncrequest {
  synctype: Array<QbTypes>,
  companyid: string,
  time: Timestamp
}
