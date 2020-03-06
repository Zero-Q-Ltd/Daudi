import * as util from "util";
import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';
import { CompanySync } from "./models/Cloud/CompanySync";
import { OrderCreate } from './models/Cloud/OrderCreate';
import { emptyDaudiCustomer } from './models/Daudi/customer/Customer';
import { Order } from "./models/Daudi/order/Order";
import { SMS } from './models/Daudi/sms/sms';
import { MyTimestamp } from './models/firestore/firestoreTypes';
import { DaudiPayment, emptyPayment } from "./models/payment/DaudiPayment";
import { Invoice_Estimate } from "./models/Qbo/QboOrder";
import { toObject } from "./models/utils/SnapshotUtils";
import { creteOrder, updateOrder } from './tasks/crud/daudi/Order';
import { paymentDoc } from "./tasks/crud/daudi/Paymnet";
import { ReadAndInstantiate } from "./tasks/crud/daudi/QboConfig";
import { updateCustomer } from './tasks/crud/qbo/customer/update';
import { QbOrder } from './tasks/crud/qbo/Order/create';
import { resolvePayment } from "./tasks/resolvepayment";
import { sendsms } from './tasks/sms/sms';
import { ordersms, trucksms } from './tasks/sms/smscompose';
import { processSync } from './tasks/syncdb/processSync';
import { validOrderUpdate, validTruckUpdate } from './validators/orderupdate';

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
  console.log(data);
  return ReadAndInstantiate(data.omcId).then((result) => {
    // console.log(result.qbo)
    return result.qbo.createEstimate(new QboOrder(data.order, result.config).QboOrder).then((createResult) => {
      /**
       * Only send sn SMS when estimate creation is complete
       * Make the two processes run parallel so that none is blocking
       */
      const EstimateResult = createResult.Estimate as Invoice_Estimate;
      data.order.QbConfig.EstimateId = EstimateResult.Id;
      return Promise.all([ordersms(data.order, data.omcId), validOrderUpdate(data.order, data.omcId), creteOrder(data.order, data.omcId)]);
    });
  });
});
/**
 * create an order from the client directly
 */
exports.createInvoice = functions.https.onCall((data: OrderCreate, context) => {
  console.log(data);
  return ReadAndInstantiate(data.omcId).then((result) => {
    // console.log(result.qbo)
    return result.qbo.createInvoice(new QboOrder(data.order, result.config).QboOrder).then((createResult) => {
      /**
       * Only send sn SMS when invoice creation is complete
       * Make the two processes run parallel so that none is blocking
       */
      const InvoiceResult = createResult.Invoice as Invoice_Estimate;
      data.order.QbConfig.InvoiceId = InvoiceResult.Id;
      data.order.stage = 2;
      return Promise.all([ordersms(data.order, data.omcId), validOrderUpdate(data.order, data.omcId), updateOrder(data.order, data.omcId)]);
    });
  });
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
      const customerbefore = snap.before.data();
      if (!customerbefore) {
        return true;
      }
      if (customerbefore.QbId === null || customerbefore.QbId === '') {
        // this customer has just been created
        return true;
      }
      const customer = toObject(emptyDaudiCustomer, snap.after);

      return ReadAndInstantiate(context.params.omcId).then(res => {
        return updateCustomer(customer, res.qbo);
      });
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

/**
 * Listens to order changes and applies a myriad of different possible actioins
 */
exports.orderUpdated = functions.firestore
  .document("/omc/{omcId}/orders/{orderId}")
  .onUpdate((data, context) => {
    console.log(data);
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);

      const order = data.after.data() as Order;
      /**
       * make sure that the stage has increased
       * @todo cater for orders reverted
       */
      console.log(util.inspect(order, false, null, false /* enable colors */));

      const orderbefore = data.before.data() as Order;
      if (!orderbefore) {
        return true;
      }
      const omcId = context.params.omcId;
      if (orderbefore.stage < order.stage) {
        order.Id = data.after.id;
        if (order.notifications.sms) {
          /**
           * Make the two processes run parallel so that none is blocking
           */
          return Promise.all([ordersms(order, omcId), validOrderUpdate(order, omcId)]);
        } else {
          console.log("Ignoring change in orders not requiring SMS");
          return validOrderUpdate(order, omcId);
        }
      } else if (orderbefore.truck.stage < order.truck.stage) {
        // return truckdatachanged(order)
        return Promise.all([trucksms(order, omcId), validTruckUpdate(order, omcId)]);
      } else {
        console.log("Order Info has changed, but stage has not increased");
        return true;
      }
    }
  });

exports.requestsync = functions.https.onCall((data: CompanySync, _) => {
  console.log(data);
  return ReadAndInstantiate(data.omcId).then((result) => {
    // console.log(result.qbo)
    return processSync(data.sync, result.qbo, data.omcId, result.config);
  });
});

/**
 * Combines RTDB with cloud firestore to provide realtime updates for presence detection
 */
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

      admin.database().ref();

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

/**
 * This is the base for all payments
 * Irrespective of the souce of payment, a document is written to the db
 * This initiates QBo ops and records any resulting errors
 */
exports.dbPayment = functions.firestore
  .document("/omc/{omcId}/payments/{paymentId}")
  .onCreate((snap, context) => {
    // console.log(snap);
    // A new customer has been updated
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      const payment = snap.data() as DaudiPayment;
      return ReadAndInstantiate(context.params.omcId).then((result) => {
        return resolvePayment(payment, result.qbo, context.params.omcId);
      });
    }
  });

/**
 * a way for the client app to re initiate a payment trigger
 */

exports.paymentClientInit = functions.https.onCall((data: { paymentId: string, omcId: string; }, context) => {
  console.log(data);
  return paymentDoc(data.omcId, data.paymentId)
    .get()
    .then(res => {
      const payment = toObject(emptyPayment(), res);
      return ReadAndInstantiate(data.omcId).then((result) => {
        return resolvePayment(payment, result.qbo, data.omcId);
      });
    });

});

/**
 * Payment NOtification endpoint
 */

// exports.paymentClientInit = functions.https.onRequest((req, res) => {
//   console.log(data);
//   return PaymentDoc(data.omcId, data.paymentId)
//     .get()
//     .then(res => {
//       const payment = toObject(emptyPayment(), res)
//       return ReadAndInstantiate(data.omcId).then((result) => {
//         return resolvePayment(payment, result.qbo, data.omcId)
//       })
//     })

// });