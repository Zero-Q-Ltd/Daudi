import { firestore } from "firebase";
export interface QBOconfig {
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
    };
}
