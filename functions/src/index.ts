import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { sendsms } from './tasks/sms/sms';
import { SMS } from './models/Daudi/sms/sms';
import { initCompanyInfo } from './tasks/crud/qbo/CompanyInfo/init';
import { OMC } from './models/Daudi/omc/OMC';
import { OMCConfig } from './models/Daudi/omc/Config';
import { Environment } from './models/Daudi/omc/Environments';
import { initFuels } from './tasks/crud/qbo/Item/Init';
import { Depot } from './models/Daudi/depot/Depot';
import { initDepots } from './tasks/crud/qbo/Class/init';
import { initTaxService } from './tasks/crud/qbo/tax/init';
import { createQbo } from './tasks/sharedqb';
import { createInvoice } from './tasks/crud/qbo/invoice/create';
import { Order } from './models/Daudi/order/Order';
import { createEstimate } from './tasks/crud/qbo/Estimate/create';
import { ordersms } from './tasks/sms/smscompose';
import { validorderupdate } from './validators/orderupdate';
import { MyTimestamp } from './models/firestore/firestoreTypes';
import { QuickBooks } from './libs/qbmain';
import { CompanySync } from "./models/Cloud/CompanySync";
import { processSync } from './tasks/syncdb/processSync';
import { readConfig } from './tasks/crud/daudi/readConfig';
import { DaudiCustomer } from './models/Daudi/customer/Customer';
import { updateCustomer } from './tasks/crud/qbo/customer/update';
import { OrderCreate } from './models/Cloud/OrderCreate';
import { creteOrder, updateOrder } from './tasks/crud/daudi/Order';

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

  return createQbo(data.omcId, data.config, data.environment).then(async result => {
    console.log(result)
    const est = new createEstimate(data.order, result, data.config, data.environment)
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

});

/**
 * create an order from the client directly
 */
exports.createInvoice = functions.https.onCall((data: OrderCreate, context) => {

  return createQbo(data.omcId, data.config, data.environment).then(async result => {
    console.log(result)
    const inv = new createInvoice(data.order, result, data.config, data.environment)
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

});


exports.customerUpdated = functions.firestore
  .document("/omc/{omcId}/customer/{customerId}")
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
      return readConfig(context.params.omcId)
        .then(val => {
          const config: OMCConfig = val.data() as OMCConfig
          const customer: DaudiCustomer = snap.after.data() as DaudiCustomer
          const env: Environment = customer.environment
          return createQbo(context.params.omcId, config, env).then(qbo => {
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

exports.requestsync = functions.https.onCall(((data: CompanySync, _) => {
  return createQbo(data.omc.Id, data.config, data.environment)
    .then((qbo: QuickBooks) => {
      return processSync(data.sync, qbo, data.omc.Id, data.config, data.environment);
    });
}))

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

const h = {
  "QueryResponse": {
    "Bill": [
      {
        "SalesTermRef": {
          "value": "6"
        },
        "DueDate": "2019-12-18",
        "Balance": 0,
        "domain": "QBO",
        "sparse": false,
        "Id": "193",
        "SyncToken": "1",
        "MetaData": {
          "CreateTime": "2019-12-18T02:39:15-08:00",
          "LastUpdatedTime": "2019-12-18T02:40:07-08:00"
        },
        "DocNumber": "ASE-097890/GUL",
        "TxnDate": "2019-12-18",
        "CurrencyRef": {
          "value": "KES",
          "name": "Kenyan Shilling"
        },
        "ExchangeRate": 1,
        "PrivateNote": "NEW SHIP PMS",
        "LinkedTxn": [
          {
            "TxnId": "194",
            "TxnType": "BillPaymentCheck"
          }
        ],
        "Line": [
          {
            "Id": "1",
            "LineNum": 1,
            "Description": "ASE-097890",
            "Amount": 0,
            "DetailType": "ItemBasedExpenseLineDetail",
            "ItemBasedExpenseLineDetail": {
              "BillableStatus": "NotBillable",
              "ItemRef": {
                "value": "43",
                "name": "PMS ASE"
              },
              "Qty": 1500,
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          },
          {
            "Id": "2",
            "LineNum": 2,
            "Description": "KES Component pms",
            "Amount": 9800,
            "DetailType": "AccountBasedExpenseLineDetail",
            "AccountBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "AccountRef": {
                "value": "129",
                "name": "Cost of Goods Sold"
              },
              "BillableStatus": "NotBillable",
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          }
        ],
        "VendorRef": {
          "value": "62",
          "name": "GULF OIL"
        },
        "APAccountRef": {
          "value": "142",
          "name": "Accounts Payable (A/P)"
        },
        "TotalAmt": 9800
      },
      {
        "SalesTermRef": {
          "value": "6"
        },
        "DueDate": "2019-12-18",
        "Balance": 0,
        "domain": "QBO",
        "sparse": false,
        "Id": "190",
        "SyncToken": "1",
        "MetaData": {
          "CreateTime": "2019-12-18T02:23:39-08:00",
          "LastUpdatedTime": "2019-12-18T02:24:21-08:00"
        },
        "DocNumber": "2020MSA7654321",
        "TxnDate": "2019-12-18",
        "CurrencyRef": {
          "value": "KES",
          "name": "Kenyan Shilling"
        },
        "ExchangeRate": 1,
        "LinkedTxn": [
          {
            "TxnId": "191",
            "TxnType": "BillPaymentCheck"
          },
          {
            "TxnId": "168",
            "TxnType": "BillPaymentCheck"
          }
        ],
        "Line": [
          {
            "Id": "1",
            "LineNum": 1,
            "Description": "PMS Tax Entry#s 2020MSA7654321",
            "Amount": 0,
            "DetailType": "ItemBasedExpenseLineDetail",
            "ItemBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "BillableStatus": "NotBillable",
              "ItemRef": {
                "value": "44",
                "name": "PMS ENTRY"
              },
              "UnitPrice": 0,
              "Qty": 1500,
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          },
          {
            "Id": "2",
            "LineNum": 2,
            "Amount": 19000,
            "DetailType": "AccountBasedExpenseLineDetail",
            "AccountBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "AccountRef": {
                "value": "129",
                "name": "Cost of Goods Sold"
              },
              "BillableStatus": "NotBillable",
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          }
        ],
        "VendorRef": {
          "value": "61",
          "name": "KRA"
        },
        "APAccountRef": {
          "value": "142",
          "name": "Accounts Payable (A/P)"
        },
        "TotalAmt": 19000
      },
      {
        "SalesTermRef": {
          "value": "6"
        },
        "DueDate": "2019-12-03",
        "Balance": 0,
        "domain": "QBO",
        "sparse": false,
        "Id": "175",
        "SyncToken": "1",
        "MetaData": {
          "CreateTime": "2019-12-03T04:17:33-08:00",
          "LastUpdatedTime": "2019-12-11T01:10:22-08:00"
        },
        "TxnDate": "2019-12-03",
        "CurrencyRef": {
          "value": "KES",
          "name": "Kenyan Shilling"
        },
        "ExchangeRate": 1,
        "Line": [
          {
            "Id": "1",
            "LineNum": 1,
            "Amount": 0,
            "DetailType": "ItemBasedExpenseLineDetail",
            "ItemBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "BillableStatus": "NotBillable",
              "ItemRef": {
                "value": "40",
                "name": "2020MSA1234568 (deleted)"
              },
              "UnitPrice": 0,
              "Qty": 1,
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          }
        ],
        "VendorRef": {
          "value": "61",
          "name": "KRA"
        },
        "APAccountRef": {
          "value": "142",
          "name": "Accounts Payable (A/P)"
        },
        "TotalAmt": 0
      },
      {
        "SalesTermRef": {
          "value": "6"
        },
        "DueDate": "2019-11-30",
        "Balance": 0,
        "domain": "QBO",
        "sparse": false,
        "Id": "165",
        "SyncToken": "3",
        "MetaData": {
          "CreateTime": "2019-11-29T16:19:20-08:00",
          "LastUpdatedTime": "2019-11-30T00:43:44-08:00"
        },
        "DocNumber": "GU-0001",
        "TxnDate": "2019-11-30",
        "CurrencyRef": {
          "value": "USD",
          "name": "United States Dollar"
        },
        "ExchangeRate": 103,
        "LinkedTxn": [
          {
            "TxnId": "167",
            "TxnType": "BillPaymentCheck"
          }
        ],
        "Line": [
          {
            "Id": "1",
            "LineNum": 1,
            "Description": "50000 LTRS PMS",
            "Amount": 2567000,
            "DetailType": "AccountBasedExpenseLineDetail",
            "AccountBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "AccountRef": {
                "value": "129",
                "name": "Cost of Goods Sold"
              },
              "BillableStatus": "NotBillable",
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          }
        ],
        "VendorRef": {
          "value": "63",
          "name": "GULF OIL usd"
        },
        "APAccountRef": {
          "value": "143",
          "name": "Accounts Payable (A/P) - USD"
        },
        "TotalAmt": 2567000
      },
      {
        "SalesTermRef": {
          "value": "6"
        },
        "DueDate": "2019-11-30",
        "Balance": 0,
        "domain": "QBO",
        "sparse": false,
        "Id": "163",
        "SyncToken": "2",
        "MetaData": {
          "CreateTime": "2019-11-29T16:07:47-08:00",
          "LastUpdatedTime": "2019-11-30T00:36:11-08:00"
        },
        "DocNumber": "ASE-987",
        "TxnDate": "2019-11-30",
        "CurrencyRef": {
          "value": "KES",
          "name": "Kenyan Shilling"
        },
        "ExchangeRate": 1,
        "LinkedTxn": [
          {
            "TxnId": "166",
            "TxnType": "BillPaymentCheck"
          }
        ],
        "Line": [
          {
            "Id": "1",
            "LineNum": 1,
            "Amount": 0,
            "DetailType": "ItemBasedExpenseLineDetail",
            "ItemBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "BillableStatus": "NotBillable",
              "ItemRef": {
                "value": "35",
                "name": "ENTRY (deleted)"
              },
              "UnitPrice": 0,
              "Qty": 50001,
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          },
          {
            "Id": "2",
            "LineNum": 2,
            "Description": "Kenys shilling component",
            "Amount": 23000,
            "DetailType": "AccountBasedExpenseLineDetail",
            "AccountBasedExpenseLineDetail": {
              "CustomerRef": {
                "value": "60",
                "name": "EMKAY PET:GULF HORIZON"
              },
              "AccountRef": {
                "value": "129",
                "name": "Cost of Goods Sold"
              },
              "BillableStatus": "NotBillable",
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          }
        ],
        "VendorRef": {
          "value": "62",
          "name": "GULF OIL"
        },
        "APAccountRef": {
          "value": "142",
          "name": "Accounts Payable (A/P)"
        },
        "TotalAmt": 23000
      },
      {
        "SalesTermRef": {
          "value": "6"
        },
        "DueDate": "2019-11-30",
        "Balance": 0,
        "domain": "QBO",
        "sparse": false,
        "Id": "162",
        "SyncToken": "1",
        "MetaData": {
          "CreateTime": "2019-11-29T16:01:39-08:00",
          "LastUpdatedTime": "2019-11-29T16:01:59-08:00"
        },
        "DocNumber": "2020MSA1234567",
        "TxnDate": "2019-11-30",
        "CurrencyRef": {
          "value": "KES",
          "name": "Kenyan Shilling"
        },
        "ExchangeRate": 1,
        "Line": [
          {
            "Id": "1",
            "LineNum": 1,
            "Description": "AGO BATCH # 50000",
            "Amount": 0,
            "DetailType": "ItemBasedExpenseLineDetail",
            "ItemBasedExpenseLineDetail": {
              "BillableStatus": "NotBillable",
              "ItemRef": {
                "value": "25",
                "name": "2020MSA1234567 (deleted)"
              },
              "UnitPrice": 0,
              "Qty": 50000,
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          }
        ],
        "VendorRef": {
          "value": "61",
          "name": "KRA"
        },
        "APAccountRef": {
          "value": "142",
          "name": "Accounts Payable (A/P)"
        },
        "TotalAmt": 0
      }
    ],
    "startPosition": 1,
    "maxResults": 6,
    "totalCount": 6
  },
  "time": "2019-12-28T10:07:33.035-08:00"
}