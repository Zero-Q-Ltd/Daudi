import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import Timestamp = admin.firestore.Timestamp;
import { sendsms } from './tasks/sms/sms';
import { SMS } from './models/Daudi/sms/sms';
import { initCompanyInfo } from './tasks/crud/qbo/CompanyInfo/init';
import { OMC } from './models/Daudi/omc/OMC';
import { Config } from './models/Daudi/omc/Config';
import { Environment } from './models/Daudi/omc/Environments';
import { initFuels } from './tasks/crud/qbo/Item/Init';
import { Depot } from './models/Daudi/depot/Depot';
import { initDepots } from './tasks/crud/qbo/Class/init';
import { initTaxService } from './tasks/crud/qbo/tax/init';
import { createQbo } from './tasks/sharedqb';

const alreadyRunEventIDs: Array<string> = [];

function isAlreadyRunning(eventID: string) {
  return alreadyRunEventIDs.indexOf(eventID) >= 0;
}

function markAsRunning(eventID: string) {
  alreadyRunEventIDs.push(eventID);
}

/**
 * create an order from the client directly
 */
// exports.createInvoice = functions.https.onCall((data, context) => {
//   const order = data as Order;
//   console.log(data);
//   return createInvoice(order).then(() => {
//     /**
//      * Only send sn SMS when order creation is complete
//      * Make the two processes run parallel so that none is blocking
//      */
//     return Promise.all([ordersms(order), validorderupdate(order)]);
//   });
// });
/**
 * This is a function that should ONLY be called by system admins
 * It initialises a company by creating all the relevant entries on QBO and notes their ID's
 */
exports.initCompany = functions.https.onCall((data: { omc: OMC, config: Config, environment: Environment, depots: Array<Depot> }, context) => {

  console.log(data);
  return createQbo(data.omc.Id, data.config, data.environment).then(result => {
    const qbo = result;
    return Promise.all([
      // initCompanyInfo(data.omc, data.config, data.environment, qbo),
      initFuels(data.omc, data.config, data.environment, qbo),
      // initTaxService(data.omc, data.config, data.environment, qbo),
      // initDepots(data.omc, data.config, data.environment, data.depots, qbo)
    ]);
  })
});

/**
 * create a company from the client directly
 */
// exports.createcustomer = functions.https.onCall((data, context) => {
//   const company = data as Customer;
//   console.log(data);
//   return createCustomer(company);
// });

exports.smscreated = functions.firestore
  .document("/sms/{smsID}")
  .onCreate((data, context) => {
    console.log(data);
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    }
    markAsRunning(eventID);
    return sendsms(data.data() as SMS, context.params.smsID);
  });

exports.onUserStatusChanged = functions.database
  .ref("/admins/{uid}")
  .onUpdate((change, context) => {
    // Get the data written to Realtime Database
    const eventStatus = change.after.val();
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      // Then use other event data to create a reference to the
      // corresponding Firestore document.
      const userStatusFirestoreRef = admin
        .firestore()
        .doc(`admins/${context.params.uid}`);

      // It is likely that the Realtime Database change that triggered
      // this event has already been overwritten by a fast change in
      // online / offline status, so we'll re-read the current data
      // and compare the timestamps.
      return change.after.ref.once("value").then(statusSnapshot => {
        const status = statusSnapshot.val();
        console.log(status, eventStatus);
        return userStatusFirestoreRef.update({
          status: {
            online: status.online,
            time: Timestamp.now()
          }
        });
      });
    }
  });