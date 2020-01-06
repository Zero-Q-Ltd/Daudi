import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';
import { QuickBooks } from './libs/qbmain';
import { CompanySync } from "./models/Cloud/CompanySync";
import { OrderCreate } from './models/Cloud/OrderCreate';
import { DaudiCustomer, emptyDaudiCustomer } from './models/Daudi/customer/Customer';
import { SMS } from './models/Daudi/sms/sms';
import { MyTimestamp } from './models/firestore/firestoreTypes';
import { creteOrder, updateOrder } from './tasks/crud/daudi/Order';
import { updateCustomer } from './tasks/crud/qbo/customer/update';
import { createEstimate } from './tasks/crud/qbo/Estimate/create';
import { createInvoice } from './tasks/crud/qbo/invoice/create';
import { createQbo } from './tasks/sharedqb';
import { sendsms } from './tasks/sms/sms';
import { ordersms } from './tasks/sms/smscompose';
import { processSync } from './tasks/syncdb/processSync';
import { validorderupdate } from './validators/orderupdate';
import { readQboConfig } from "./tasks/crud/daudi/QboConfig";
import { toArray, toObject } from "./models/utils/SnapshotUtils";
import { EmptyQboConfig, QboCofig } from "./models/Cloud/QboEnvironment";

admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });


const alreadyRunEventIDs: Array<string> = [];

function isAlreadyRunning(eventID: string) {
  return alreadyRunEventIDs.indexOf(eventID) >= 0;
}

function markAsRunning(eventID: string) {
  alreadyRunEventIDs.push(eventID);
}
/**
 * create an estimate from the client directly
 */
exports.createEstimate = functions.https.onCall((data: OrderCreate, context) => {
  return readQboConfig(data.omcId).then(snapshot => {
    const config = toObject(EmptyQboConfig, snapshot)
    return createQbo(data.omcId, config, true).then(async result => {
      console.log(result)
      const est = new createEstimate(data.order, config)
      return result.createEstimate(est.formulateEstimate()).then((createResult) => {
        /**
         * Only send sn SMS when estimate creation is complete
         * Make the two processes run parallel so that none is blocking
         */
        /**
         * @todo update the Estimate ID
         */
        return Promise.all([ordersms(data.order, data.omcId), validorderupdate(data.order, result), creteOrder(data.order, data.omcId)])
      });
    })
  })

});

/**
 * create an order from the client directly
 */
exports.createInvoice = functions.https.onCall((data: OrderCreate, context) => {
  return readQboConfig(data.omcId).then(snapshot => {
    const config = toObject(EmptyQboConfig, snapshot)
    return createQbo(data.omcId, config, true).then(async result => {
      console.log(result)
      const inv = new createInvoice(data.order, config)
      return result.createInvoice(inv.formulateInvoice()).then((createResult) => {
        /**
         * Only send sn SMS when invoice creation is complete
         * Make the two processes run parallel so that none is blocking
         */
        /**
         * @todo update the invoice id
         */
        data.order.stage = 2
        return Promise.all([ordersms(data.order, data.omcId), validorderupdate(data.order, result), updateOrder(data.order, data.omcId)]);
      });
    })
  })
});


exports.customerUpdated = functions.firestore
  .document("/omc/{omcId}/customers/{customerId}")
  .onUpdate((snap, context) => {
    console.log(snap);
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      // A new customer has been updated
      const customerbefore = snap.before.data()
      if (!customerbefore) {
        return true;
      }
      if (customerbefore.QbId === null || customerbefore.QbId === '') {
        // this customer has just been created
        return true;
      }
      return readQboConfig(context.params.omcId)
        .then(snapshot => {
          const config = toObject(EmptyQboConfig, snapshot)
          const customer = toObject(emptyDaudiCustomer, snap.after)
          return createQbo(context.params.omcId, config, true).then(qbo => {
            return updateCustomer(customer, qbo);
          })
        })
    }
  });

/**
 * create a company from the client directly
 */
// exports.createcustomer = functions.https.onCall((data, context) => {
//   const company = data as Customer;
//   console.log(data);
//   return createCustomer(company);
// });
/**
 * Listens to when an sms object has been created in the database and contacts the 3rd party bulk SMS provider
 * @todo Add a callback for when the SMS is successfully sent and possibly when it's read
 */
exports.smscreated = functions.firestore
  .document("/omc/{omcId}/sms/{smsID}")
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

exports.requestsync = functions.https.onCall((data: CompanySync, _) => {
  console.log(data)
  return readQboConfig(data.omcId).then(snapshot => {
    const config = toObject(EmptyQboConfig, snapshot)
    return createQbo(data.omcId, config, true)
      .then((qbo: QuickBooks) => {
        return processSync(data.sync, qbo, data.omcId, config);
      });
  })
})

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
            time: MyTimestamp.now()
          }
        });
      });
    }
  });
