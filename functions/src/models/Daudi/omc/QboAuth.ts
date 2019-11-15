import { firestore } from "firebase-admin";
export interface QBOconfig {
    companyId: number;
    clientId: string;
    clientSecret: string;
    webhooksVerifier: string;
    isSandbox: boolean;
    authConfig: {
        previousDCT: firestore.Timestamp;
        accessToken: string;
        refreshToken: string;
        accesstokenExpiry: firestore.Timestamp;
        refreshtokenExpiry: firestore.Timestamp;
        time: firestore.Timestamp;
    };
}
