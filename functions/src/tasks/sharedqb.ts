import * as moment from "moment";
import { QuickBooks } from "../libs/qbmain"; // quickbooks sdk
import { firestore } from "firebase-admin";
import { Companyconfig, qbemptycompany } from "../models/Qbo/Company";
import { Config } from "../models/Daudi/omc/Config";
import { Environment } from "../models/Daudi/omc/Environments";
import { QBOAuthCOnfig, AuthConfig } from "../models/Daudi/omc/QboAuthConfig";

export function createQbo(omcId: string, config: Config, enviromnent: Environment): Promise<QuickBooks> {
  const functioname = "resolvecompany";
  const qbo = new QuickBooks({
    clientID: config.Qbo[enviromnent].auth.clientId,
    clientSecret: config.Qbo[enviromnent].auth.clientSecret,
    debug: true,
    minorversion: 4,
    realmId: config.Qbo[enviromnent].auth.companyId.toString(),
    refreshtoken: config.Qbo[enviromnent].auth.authConfig.refreshToken,
    token: config.Qbo[enviromnent].auth.authConfig.accessToken,
    useSandbox: enviromnent === "sandbox"
  });
  if (moment().isAfter(moment(config.Qbo[enviromnent].auth.authConfig.accesstokenExpiry))) {
    console.log(functioname, "expired token");
    return qbo.refreshAccesstoken().then(result => {
      const newtokens = JSON.parse(JSON.stringify(result));
      const dbobject: AuthConfig = {
        accessToken: newtokens.access_token,
        refreshToken: newtokens.refresh_token,
        /*
         * Give a safe period of 10 seconds for expiry of tokens, because execution of the function
         * takes sometime and the values provided are for the validity
         */
        previousDCT: config.Qbo[enviromnent].auth.authConfig.time,
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

      config.Qbo[enviromnent].auth.authConfig = dbobject;
      return firestore()
        .doc(omcId)
        .collection("config")
        .doc("main")
        .update(dbobject)
        .then(() => {
          console.log(functioname, "successfully updated token");
          console.log(qbo);
          // qbo = new QuickBooks({
          //   clientID: config.clientid,
          //   clientSecret: config.clientSecret,
          //   debug: true,
          //   minorversion: 4,
          //   realmId: String(config.companyid),
          //   refreshtoken: config.authconfig.refreshtoken,
          //   token: config.authconfig.accessToken,
          //   useSandbox: config.issandbox
          // });
          return qbo;
        });
    });
  } else {
    return new Promise(async (resolver, reject) => {
      console.log(functioname, "Valid token");
      resolver(qbo);
    });
  }
}
