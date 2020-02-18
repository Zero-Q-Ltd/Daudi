import { MyTimestamp } from '../firestore/firestoreTypes';

export interface QBOAuthCOnfig {
  companyId: number;
  clientId: string;
  clientSecret: string;
  webhooksVerifier: string;
  authConfig: AuthConfig;
}

export interface AuthConfig {
  previousDCT: MyTimestamp;
  accessToken: string;
  refreshToken: string;
  accesstokenExpiry: MyTimestamp;
  refreshtokenExpiry: MyTimestamp;
  time: Date;
}
