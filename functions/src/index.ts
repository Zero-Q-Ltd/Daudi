import * as functions from "firebase-functions";
import * as webhookhandler from "./tasks/webhookhandler";
import * as admin from "firebase-admin";
import { resolveipn } from "./tasks/resolvepayment";
import { ipnmodel, QbTypes } from "./models/common";
import { sendsms } from "./tasks/sms/sms";
import { ordersms, trucksms } from "./tasks/sms/smscompose";
import { createQbo } from "./tasks/sharedqb";
import { QuickBooks } from "./libs/qbmain";
import { syncCustomers } from "./tasks/syncdb/syncCustomers";
import { SMS } from "./models/Daudi/sms";
import { Order_ } from "./models/Daudi/Order";
import { emptytruck } from "./models/Daudi/Truck";
import { syncAdmins } from "./tasks/syncdb/syncAdmins";
import { Company_ } from "./models/Daudi/Company";
import { syncBatches } from "./tasks/syncdb/syncBatches";
import { syncrequest } from "./models/Daudi/Sync";
import { syncItems } from "./tasks/syncdb/syncItems";
import { createOrder } from "./tasks/crud/qbo/createOrder";
import { createCustomer } from "./tasks/crud/qbo/createCustomer";
import { updateCustomer } from "./tasks/crud/qbo/updateCustomer";
import { validorderupdate } from "./validators/orderupdate";
import { truckDetails } from "./tasks/truckdetails";
import { paymentFcm } from "./tasks/FCM/paymentFcm";
import { truckdatachanged } from "./tasks/truckchanges";
import Timestamp = admin.firestore.Timestamp;
// Imports the Google Cloud client library
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });

const responseformat = {
  responseCode: "OK",
  responseMessage: "SUCCESSFUL"
};
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
exports.createorder = functions.https.onCall((data, context) => {
  const order = data as Order_;
  console.log(data);
  return createOrder(order).then(() => {
    /**
     * Only send sn SMS when order creation is complete
     * Make the two processes run parallel so that none is blocking
     */
    return Promise.all([ordersms(order), validorderupdate(order)]);
  });
});

/**
 * create a company from the client directly
 */
exports.createcustomer = functions.https.onCall((data, context) => {
  const company = data as Company_;
  console.log(data);
  return createCustomer(company);
});

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

exports.customerUpdated = functions.firestore
  .document("/companies/{companyId}")
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
      return updateCustomer(snap.after.data() as Company_);
    }
  });

exports.orderUpdated = functions.firestore
  .document("/depots/{depotID}/orders/{orderid}")
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

      const order = data.after.data() as Order_;
      /**
       * make sure that the stage has increased
       * @todo cater for orders reverted
       */
      const orderbefore = data.before.data() as Order_
      if (!orderbefore) {
        return true
      }
      if (orderbefore.stage < order.stage) {
        order.Id = data.after.id;
        if (order.notifications.allowsms) {
          /**
           * Make the two processes run parallel so that none is blocking
           */
          return Promise.all([ordersms(order), validorderupdate(order)]);
        } else {
          console.log("Ignoring change in orders not requiring SMS");
          return validorderupdate(order);
        }
      } else {
        console.log("Order Info has changed, but stage has not increased");
        return true;
      }
    }
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
exports.truckUpdated = functions.firestore
  .document("/depots/{depotID}/trucks/{truckid}")
  .onUpdate((data, context) => {
    console.log(data);
    /**
     * A truck has been modified
     * only send the SMS if the truck stage has been incremented
     */
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      return truckdatachanged(
        { ...emptytruck, ...data.before.data(), ...{ id: data.before.id } },
        { ...emptytruck, ...data.after.data(), ...{ id: data.after.id } }
      );
    }
  });

exports.truckCreated = functions.firestore
  .document("/depots/{depotID}/trucks/{truckid}")
  .onCreate((data, context) => {
    console.log(data);
    /**
     * A truck has been created
     */
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      return trucksms(
        { ...emptytruck, ...data.data(), ...{ id: data.id } }
      );
    }
  });

exports.ipnsandbox_db = functions.firestore
  .document("/sandboxpayments/{ipnid}")
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
    }
    markAsRunning(eventID);
    const ipn = snap.data() as ipnmodel;
    return resolveipn(ipn, context.params.ipnid).then(() => {
      ipn.daudiFields.status = 2;
      return paymentFcm(ipn);
    });
  });
exports.ipnprod_db = functions.firestore
  .document("/prodpayments/{ipnid}")
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
      const ipn = snap.data() as ipnmodel;
      return resolveipn(ipn, context.params.ipnid).then(() => {
        ipn.daudiFields.status = 2;
        return paymentFcm(ipn);
      });
    }
  });

exports.requestsync = functions.https.onCall((data, _) => {
  const sync = data as syncrequest;
  console.log(sync);
  return createQbo(sync.companyid).then((qbo: QuickBooks) => {
    return syncdata(sync, qbo);
  });
});

function syncdata(sync: syncrequest, qbo: QuickBooks) {
  return Promise.all(
    sync.synctype.map(async (syncdetail: QbTypes) => {
      switch (syncdetail) {
        case "Customer":
          console.log("Syncing customers");
          return await syncCustomers(qbo);
        case "Employee":
          console.log("Syncing employees");
          return true;
        // return await syncAdmins(qbo);
        case "Item":
          console.log("Syncing Items zote");
          return await syncItems(qbo);
        case "BillPayment":
          console.log("Syncing batches");
          return await syncBatches(qbo, sync.time);
        default:
          console.log("Unrecognized object for syncdetected, breaking");
          return true;
      }
    })
  );
}

exports.autosync = functions.pubsub
  .topic("autosync")
  .onPublish((message, context) => {
    const sync = message.json as syncrequest;
    return createQbo(sync.companyid).then((qbo: QuickBooks) => {
      return syncdata(sync, qbo);
    });
  });

/**
 * a way for the client app to execute a cloud function directly
 */

exports.ipnsandboxcallable = functions.https.onCall((data, context) => {
  const ipn = data as ipnmodel;
  console.log(data);
  return resolveipn(ipn, ipn.billNumber.toString()).then(() => {
    /**
     * force the fcm to send a payment received msg, because otherwise the new ipn data wont be known
     * unless we make a db read before sending, which at this point is unneccessary
     */
    ipn.daudiFields.status = 2;
    return paymentFcm(ipn);
  });
});

/**
 * a way for the client app to execute a cloud function directly
 */

exports.ipnprodcallable = functions.https.onCall((data, context) => {
  const ipn = data as ipnmodel;
  console.log(data);
  return resolveipn(ipn, ipn.billNumber.toString()).then(() => {
    /**
     * force the fcm to send a payment received msg, because otherwise the new ipn data wont be known
     * unless we make a db read before sending, which at this point is unneccessary
     */
    ipn.daudiFields.status = 2;
    return paymentFcm(ipn);
  });
});

exports.ipnsandbox = functions.https.onRequest((req, response) => {
  console.log(req.headers);
  console.log(req.body);
  console.log(req.body.toString());
  const ipn = req.body as ipnmodel;
  /**
   * An IPN is configured to make payment to a specific qbo company
   */
  ipn.daudiFields = {
    companyid: "193514758650394",
    sandbox: true,
    bank: "equity",
    status: ipn.billNumber ? 1 : 0
  };
  response.set("Access-Control-Allow-Credentials", "true");

  return admin
    .firestore()
    .collection("sandboxpayments")
    .doc(ipn.bankreference)
    .set(ipn)
    .then(() => {
      return response.status(200).send(responseformat);
    });
});

exports.ipnprod = functions.https.onRequest((req, response) => {
  console.log(req.headers);
  console.log(req.body);
  console.log(req.body.toString());
  const ipn = req.body as ipnmodel;

  /**
   * An IPN is configured to make payment to a specific qbo company
   */
  ipn.daudiFields = {
    companyid: "123146084183089",
    sandbox: false,
    bank: "equity",
    status: ipn.billNumber ? 1 : 0
  };
  response.set("Access-Control-Allow-Credentials", "true");

  return admin
    .firestore()
    .collection("prodpayments")
    .doc(ipn.bankreference)
    .set(ipn)
    .then(() => {
      return response.status(200).send(responseformat);
    });
});
exports.autosync = functions.pubsub
  .topic("autosync")
  .onPublish((message, context) => {
    const sync = message.json as syncrequest;
    return createQbo(sync.companyid).then((qbo: QuickBooks) => {
      /**
       * make the loop async so that qb doesnt encounter race condition and throw concurency error
       * */
      return Promise.all(
        sync.synctype.map(async (syncdetail: QbTypes) => {
          switch (syncdetail) {
            case "Customer":
              console.log("Syncing customers");
              return await syncCustomers(qbo);
            case "Employee":
              console.log("Syncing employees");
              return await syncAdmins(qbo);
            case "Item":
              console.log("Syncing Items zote");
              return await syncItems(qbo);
            case "BillPayment":
              console.log("Syncing batches");
              return await syncBatches(qbo, sync.time);
            default:
              console.log("Unrecognized object for syncdetected, breaking");
              return true;
          }
        })
      );
    });
  });

exports.truckDetail = functions.https.onRequest((req, res) => {
  console.log(req.query);
  if (
    req.query &&
    JSON.stringify(req.query) !== "{}" &&
    req.query.T &&
    req.query.D
  ) {
    return truckDetails(req.query).then(result => {
      res.status(200).send(result);
    });
  } else {
    return res
      .status(200)
      .send(
        "<h1>No data provided!!!</br>Please do not abuse this url. We have our eyes on you" +
        ' </br>Contact 0711234567 for instructions</h1></br><img src="https://emkaynow.com/assets/images/home-header.png" style="width:100%; max-width:300px;">'
      );
  }
  //Query the truck details from the database and display them
});

/**
 * single Quickboocks webhook endpoint fore releavnt updates
 * TODO: Replace Wtih api endpoint call so that the request does not hang up
 */
exports.qbwebhook = functions.https.onRequest((req, response) => {
  response.connection.setKeepAlive(true);
  // response.write("SUCCESS");
  return qbfilter(req, response);
});
//for testing purposes only
exports.qbwebhooktest = functions.https.onRequest((req, res) => {
  res.connection.setKeepAlive(true);
  // res.write("SUCCESS");

  return qbfilter(req, res);
});

function qbfilter(req: functions.https.Request, response: functions.Response) {
  const payload = JSON.stringify(req.body);
  const signature = req.get("intuit-signature");
  console.log(payload);
  // if signature is empty return 401
  if (!signature || !payload) {
    console.log("empty signature or payload");
    response.end();
    return true;
  } else {
    //This should run in the background
    return webhookhandler.processifno({ payload, signature, response });
  }
}
