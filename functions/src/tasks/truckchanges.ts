import { Truck_ } from "../models/Daudi/Truck";
import { driverchangedsms, truckchangesdsms, trucksms } from "./sms/smscompose";
import { truckFcm } from "./FCM/truckFcm";

export function truckdatachanged(truckbefore: Truck_, truckafter: Truck_) {
  const smsPromise = () =>
    new Promise((resolver, reject) => {
      if (truckafter.notifications.allowsms) {
        /**
         * SMS
         */
        if (truckbefore.stage < truckafter.stage) {
          return trucksms(truckafter);
        } else {
          console.log("Stage not increased, ignoring ....");
          return resolver(true);
        }
      } else {
        resolver(true);
      }
    });

  const fmcPromise = () => {
    if (truckafter.stage === 1) {
      /**
       * send different FCM depending on the truck stage movement
       */
      if (truckbefore.stage > truckafter.stage) {
        return truckFcm(truckafter, "Reset");
      } else if (truckbefore.stage < truckafter.stage) {
        return truckFcm(truckafter, "Approved");
      } else {
        console.log("Truck data changed, but not affecting the stage");
        return new Promise((resolver, reject) => {
          return resolver;
        });
      }
    } else {
      return new Promise((resolver, reject) => {
        resolver(true);
      });
    }
  };

  const truckChanges = () => {
    /**
     * Check truck changes
     */
    console.log(truckafter, truckbefore);
    console.log(truckafter.drivername, truckbefore.drivername);
    if (truckbefore.drivername !== truckafter.drivername) {
      return driverchangedsms(truckafter);
    } else if (truckbefore.numberplate !== truckafter.numberplate) {
      return truckchangesdsms(truckafter);
    } else {
      console.log(
        "Drivername and truck details not changed, ignoring change sms"
      );
      return new Promise((resolver, reject) => {
        resolver(true);
      });
    }
  };

  return Promise.all([smsPromise(), fmcPromise(), truckChanges()]);
}
