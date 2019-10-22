import { Truck_ } from "../../models/Daudi/Truck";
import { firestore, messaging } from "firebase-admin";
import { Admin_ } from "../../models/Daudi/Admin";

export function truckFcm(
  truck: Truck_,
  statusstring: "Approved" | "Reset"
): Promise<any> {
  console.log("sending truck FCM");
  const message = {
    notification: {
      title: `Truck ${statusstring}`,
      body: `${truck.truckId} now at Processing`,
      icon: "https://emkaynow.com/favicon.ico",
      sound: "default"
    }
  };
  return getallAdmins().then(adminsobject => {
    return Promise.all(
      adminsobject.docs
        .filter(rawadmindata => {
          const admin = rawadmindata.data() as Admin_;
          return (
            admin.config.depotdata && admin.fcmtokens && admin.fcmtokens.apk
          );
        })
        .map(async rawadmindata => {
          const admin = rawadmindata.data() as Admin_;
          return messaging().sendToDevice(admin.fcmtokens.apk, message);
        })
    );
  });
}

function getallAdmins() {
  return firestore()
    .collection("admins")
    .get();
}
