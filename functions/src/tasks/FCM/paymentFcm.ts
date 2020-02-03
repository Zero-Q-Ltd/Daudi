import {firestore, messaging} from "firebase-admin";
import {EquityBulk} from "../../models/ipn/EquityBulk";
import {Fcm} from "../../models/Cloud/Fcm";
import {Admin} from "../../models/Daudi/admin/Admin";

export function paymentFcm(ipn: EquityBulk) {
  console.log("sending payment FCM");
  let message: Fcm;
  /**
   * TODO : use settings to make query and differentiate different fcms
   */
  if (ipn.daudiFields.status === 0) {
    message = {
      notification: {
        title: "Payment Received",
        body: `of ${ipn.billAmount} for ${ipn.billNumber}. It will automatically be applied`,
        icon: "https://emkaynow.com/favicon.ico"
      }
    };
  } else {
    message = {
      notification: {
        title: "Unprocessed Payment",
        body: `of ${ipn.billAmount} Please validate this payment`,
        icon: "https://emkaynow.com/favicon.ico"
      }
    };
  }
  return getallallowedAdmins().then(adminsobject => {
    return Promise.all(
      adminsobject.docs
        .filter(rawadmindata => {
          const admin = rawadmindata.data() as Admin;
          /**
           * Only users below level 3 can receive payment notifications
           * It is mandatory that the users have tokens
           */
          (
            Number(admin.config.level) < 3 &&
            admin.config.fcm.subscriptions.payment &&
            admin.config.fcm.tokens.web
          );
        })
        .map(async rawadmindata => {
          const admin = rawadmindata.data() as Admin;
          console.log("sending to", admin);
          return messaging().sendToDevice(admin.config.fcm.tokens.web, message);
        })
    );
  });
}

function getallallowedAdmins() {
  //`settings.fcm.payment.live`, '===', true
  // return firestore().collection('admins').get();
  return firestore()
    .collection("admins")
    .get();
}

//Unprocessed Payment
