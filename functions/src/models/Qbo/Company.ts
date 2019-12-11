import { firestore } from "firebase-admin";
import { Environment } from '../Daudi/omc/Environments';

export interface Companyconfig {
  companyid: number;
  clientid: string;
  clientSecret: string;
  webhooksverifier: string;
  environment: Environment;
  authconfig: {
    previousDCT: firestore.Timestamp;
    accessToken: string;
    refreshtoken: string;
    accesstokenExpiry: firestore.Timestamp;
    refreshtokenExpiry: firestore.Timestamp;
    time: firestore.Timestamp;
    //add more entities if required
  };
}

export const qbemptycompany: Companyconfig = {
  companyid: 0,
  clientid: "",
  clientSecret: "",
  webhooksverifier: "",
  environment: Environment.sandbox,
  authconfig: {
    previousDCT: firestore.Timestamp.fromDate(new Date()),
    accessToken: "",
    refreshtoken: "",
    accesstokenExpiry: firestore.Timestamp.fromDate(new Date()),
    refreshtokenExpiry: firestore.Timestamp.fromDate(new Date()),
    time: firestore.Timestamp.fromDate(new Date())
  }
};
