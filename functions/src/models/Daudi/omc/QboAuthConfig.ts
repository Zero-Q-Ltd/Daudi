import { MyTimestamp } from "../../firestore/firestoreTypes";
import { Environment } from './Environments';


export interface QBOAuthCOnfig {
    companyId: number;
    clientId: string;
    clientSecret: string;
    webhooksVerifier: string;
    environment: Environment;
    authConfig: AuthConfig;
}
export interface AuthConfig {
    previousDCT: MyTimestamp;
    accessToken: string;
    refreshToken: string;
    accesstokenExpiry: MyTimestamp;
    refreshtokenExpiry: MyTimestamp;
    time: MyTimestamp;
}
