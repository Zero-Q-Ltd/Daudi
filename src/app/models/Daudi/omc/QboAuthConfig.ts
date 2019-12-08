import { Timestamp } from "@google-cloud/firestore";

export interface QBOAuthCOnfig {
    companyId: number;
    clientId: string;
    clientSecret: string;
    webhooksVerifier: string;
    isSandbox: boolean;
    authConfig: AuthConfig;
}
export interface AuthConfig {
    previousDCT: Timestamp;
    accessToken: string;
    refreshToken: string;
    accesstokenExpiry: Timestamp;
    refreshtokenExpiry: Timestamp;
    time: Timestamp;
}