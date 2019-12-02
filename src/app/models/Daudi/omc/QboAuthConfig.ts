import { firestore } from 'firebase';
;
export interface QBOAuthCOnfig {
    companyId: number;
    clientId: string;
    clientSecret: string;
    webhooksVerifier: string;
    isSandbox: boolean;
    authConfig: AuthConfig
}
export interface AuthConfig {
    previousDCT: firestore.Timestamp;
    accessToken: string;
    refreshToken: string;
    accesstokenExpiry: firestore.Timestamp;
    refreshtokenExpiry: firestore.Timestamp;
    time: firestore.Timestamp;
};