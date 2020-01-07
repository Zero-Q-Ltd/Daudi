import {firestore, messaging} from "firebase-admin";
import {Admin} from "../../models/Daudi/admin/Admin";
import {Order} from "../../models/Daudi/order/Order";

export function truckFcm(
  order: Order,
  statusstring: "Approved" | "Reset"
): Promise<any> {
  console.log("sending truck FCM");
  const message = {
    notification: {
      title: `Truck ${statusstring}`,
      body: `${order.QbConfig.InvoiceId} now at Processing`,
      icon: "https://emkaynow.com/favicon.ico",
      sound: "default"
    }
  };
  return getallAdmins().then(adminsobject => {
    return Promise.all(
      adminsobject.docs
        .filter(rawadmindata => {
          const admin = rawadmindata.data() as Admin;
          return (
            admin.config.app.depotid && admin.config.fcm.tokens.apk
          );
        })
        .map(async rawadmindata => {
          const admin = rawadmindata.data() as Admin;
          return messaging().sendToDevice(admin.config.fcm.tokens.apk, message);
        })
    );
  });
}

function getallAdmins() {
  return firestore()
    .collection("admins")
    .get();
}
