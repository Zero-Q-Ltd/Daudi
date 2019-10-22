import * as moment from "moment";
import { QuickBooks } from "../libs/qbmain"; // quickbooks sdk
import { firestore } from "firebase-admin";
import { Companyconfig, qbemptycompany } from "../models/Qbo/Company";

export function createQbo(companyId: string): Promise<QuickBooks> {
  const functioname = "resolvecompany";

  return firestore()
    .collection("qbconfig")
    .doc(companyId)
    .get()
    .then(data => {
      const config: Companyconfig = Object.assign(
        {},
        qbemptycompany,
        data.data()
      );
      let qbo = new QuickBooks({
        clientID: config.clientid,
        clientSecret: config.clientSecret,
        debug: true,
        minorversion: 4,
        realmId: config.companyid.toString(),
        refreshtoken: config.authconfig.refreshtoken,
        token: config.authconfig.accessToken,
        useSandbox: config.issandbox
      });
      if (moment().isAfter(moment(config.authconfig.accesstokenExpiry))) {
        console.log(functioname, "expired token");
        return qbo.refreshAccesstoken().then(result => {
          const newtokens = JSON.parse(JSON.stringify(result));
          const dbobject = {
            authconfig: {
              accessToken: newtokens.access_token,
              refreshtoken: newtokens.refresh_token,
              /*
               * Give a safe period of 10 seconds for expiry of tokens, because execution of the function
               * takes sometime and the values provided are for the validity
               */
              previousDCT: config.authconfig.time,
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
            }
          };
          //Replace the object values we're using with the new ones
          config.authconfig = dbobject.authconfig;
          return firestore()
            .collection("qbconfig")
            .doc(config.companyid.toString())
            .update(dbobject)
            .then(() => {
              console.log(functioname, "successfully updated token");
              qbo = new QuickBooks({
                clientID: config.clientid,
                clientSecret: config.clientSecret,
                debug: true,
                minorversion: 4,
                realmId: String(config.companyid),
                refreshtoken: config.authconfig.refreshtoken,
                token: config.authconfig.accessToken,
                useSandbox: config.issandbox
              });
              return qbo;
            });
        });
      } else {
        return new Promise(async (resolver, reject) => {
          console.log(functioname, "Valid token");
          resolver(qbo);
        });
      }
    });
}
