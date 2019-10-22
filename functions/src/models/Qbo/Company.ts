import { firestore } from "firebase-admin";

export interface Companyconfig {
  companyid: number;
  clientid: string;
  clientSecret: string;
  webhooksverifier: string;
  issandbox: boolean;
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
  issandbox: true,
  authconfig: {
    previousDCT: firestore.Timestamp.fromDate(new Date()),
    accessToken: "",
    refreshtoken: "",
    accesstokenExpiry: firestore.Timestamp.fromDate(new Date()),
    refreshtokenExpiry: firestore.Timestamp.fromDate(new Date()),
    time: firestore.Timestamp.fromDate(new Date())
  }
};
