

export interface QBOAuthCOnfig {
    companyId: number;
    clientId: string;
    clientSecret: string;
    webhooksVerifier: string;
    authConfig: AuthConfig;
}
export const EmptyQBOAuthCOnfig: QBOAuthCOnfig = {
    companyId: null,
    clientId: null,
    clientSecret: null,
    webhooksVerifier: null,
    authConfig: null,
}
export interface AuthConfig {
    accessToken: string;
    refreshToken: string;
    createdAt: Date;
}
