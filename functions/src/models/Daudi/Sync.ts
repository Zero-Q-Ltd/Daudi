import { QbTypes, User } from "../common";
import * as admin from "firebase-admin";
import Timestamp = admin.firestore.Timestamp;

export type syncrequest = {
  synctype: Array<QbTypes>;
  companyid: string;
  time: Timestamp;
};
export type oldsyncrequest = {
  [key in QbTypes]?: {
    timestamp: any;
    user: User;
  };
};
