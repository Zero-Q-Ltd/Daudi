import * as moment from "moment";
import { QbApiConfig, QuickBooks } from "../libs/qbmain"; // quickbooks sdk
import { firestore } from "firebase-admin";
import { QboCofig } from "../models/Cloud/QboEnvironment";
import { AuthConfig } from "../models/Cloud/QboAuthConfig";

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
  }

  const qbo = new QuickBooks(apiconfig);
  if (true) {
    // if (moment().isAfter(moment(config.auth.authConfig.accesstokenExpiry))) {
    console.log("expired token");
    // console.log(apiconfig);
    return qbo.refreshAccesstoken().then(result => {
      const newtokens = JSON.parse(JSON.stringify(result));
      const dbobject: AuthConfig = {
        accessToken: newtokens.access_token,
        refreshToken: newtokens.refresh_token,
        /*
         * Give a safe period of 10 seconds for expiry of tokens, because execution of the function
         * takes sometime and the values provided are for the validity
         */
        previousDCT: config.auth.authConfig.time,
        time: firestore.Timestamp.now(),
        refreshtokenExpiry: firestore.Timestamp.fromDate(
          moment(firestore.Timestamp.now())
            .add(newtokens.x_refresh_token_expires_in + 10, "seconds")
            .toDate()
        ),
        accesstokenExpiry: firestore.Timestamp.fromDate(
          moment(firestore.Timestamp.now())
            .add(newtokens.expires_in + 10, "seconds")
            .toDate()
        )
      };

      //Replace the object values we're using with the new ones

      config.auth.authConfig = dbobject;
      return firestore()
        .collection("omc")
        .doc(omcId)
        .collection("config")
        .doc("main")
        .update(config)
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
          }
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
