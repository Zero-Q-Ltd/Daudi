import { firestore } from "firebase-admin";
import * as moment from "moment";
import { QbApiConfig, QuickBooks } from "../libs/qbmain"; // quickbooks sdk
import { AuthConfig } from "../models/Cloud/QboAuthConfig";
import { QboCofig } from "../models/Cloud/QboEnvironment";
import { updateConfig } from "./crud/daudi/QboConfig";

export function createQbo(omcId: string, config: QboCofig, useSandbox: boolean): Promise<QuickBooks> {
  const apiconfig: QbApiConfig = {
    clientID: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
    debug: true,
    minorversion: 41,
    realmId: config.auth.companyId.toString(),
    refreshtoken: config.auth.authConfig.refreshToken,
    token: config.auth.authConfig.accessToken,
    useSandbox
  };

  const qbo = new QuickBooks(apiconfig);
  /**
   * Access tokens expire after an hour
   */
  if (moment().isAfter(moment(config.auth.authConfig.createdAt).add(50, 'minute'))) {
    // if (true) {
    console.log("expired token");
    // console.log(apiconfig);
    return qbo.refreshAccesstoken().then(result => {
      const newtokens = JSON.parse(JSON.stringify(result));
      const dbobject: AuthConfig = {
        accessToken: newtokens.access_token,
        refreshToken: newtokens.refresh_token,
        createdAt: new Date(),
      };

      //Replace the object values we're using with the new ones

      config.auth.authConfig = dbobject;
      return updateConfig(omcId, config)
        .then(() => {
          console.log("successfully updated token");
          // console.log(qbo);
          const newapiconfig: QbApiConfig = {
            clientID: config.auth.clientId,
            clientSecret: config.auth.clientSecret,
            debug: true,
            minorversion: 41,
            realmId: config.auth.companyId.toString(),
            refreshtoken: config.auth.authConfig.refreshToken,
            token: config.auth.authConfig.accessToken,
            useSandbox
          };
          return new QuickBooks(newapiconfig);
        });
    });
  } else {
    return new Promise(async (resolver, reject) => {
      console.log("Valid token");
      resolver(qbo);
    });
  }
}
