// import * as qbovalidator from "../validators/qbopayloadValidator";
// import { firestore } from "firebase-admin";
// import { Companyconfig } from "../models/Qbo/Company";
// import { syncrequest } from "../models/Daudi/Sync";
// import { eventnotifications } from "../models/Qbo/eventNotification";
// import { PubSub } from "@google-cloud/pubsub";

// /**
//  * Process the queue task
//  * 1. Retrieves the realmId from the payload
//  * 2. Queries the database to get the last CDC performed time and auth keys for the realmId
//  * 3. Performs CDC for all the subscribed entities using the lastCDCTime retrieved in step 2
//  * 4. Updates the database record with the last CDC performed time for the realmId - time when step 3 was performed
//  *
//  */

// let response_: any;

// export function processifno({ payload, signature, response }: { payload: any; signature: any; response: any; }): Promise<any> {
//   response_ = response;
//   const pubsub = new PubSub();
//   /**
//    *This presents an Immediate problem because we can only verify if the data is valid after
//    *fetching the relevant company info from the database, but a response has to be given to
//    *qb within 5 sec...
//    */
//   const data = JSON.parse(payload);

//   /**
//    * Cater fro the case scenario where many qbo companies are attached to the same app and a bulk notification is fired for all of them
//    */

//   return fetchallcompanies().then(allcompaniesdocs => {
//     const companies = allcompaniesdocs.docs.map(
//       doc => doc.data() as Companyconfig
//     );

//     return Promise.all(
//       data.eventNotifications.map((notification: { realmId: any; dataChangeEvent: { entities: eventnotifications[]; }; }, index: any) => {
//         /**
//          * create a new sync object for each company loop
//          */
//         const syncObject: syncrequest = {
//           synctype: [],
//           time: firestore.Timestamp.now(),
//           companyid: ''
//         };

//         const companyId = notification.realmId;
//         const companyconfig = companies.find(company => {
//           return (company.companyid = companyId);
//         });
//         if (!companyconfig) {
//           console.error('missing company config')
//           return true;
//         }
//         syncObject.companyid = companyId;

//         const notificationentities: Array<eventnotifications> =
//           notification.dataChangeEvent.entities;

//         notificationentities.forEach(notificationobject => {
//           syncObject.synctype.push(notificationobject.name);
//         });

//         if (qbovalidator.isValidPayload(signature, payload, companyconfig)) {
//           console.log("sending pub/sub");
//           return pubsub
//             .topic("autosync")
//             .publish(Buffer.from(JSON.stringify(syncObject)));
//         } else {
//           return new Promise((resolve, reject) => reject("Invalid pyaload"));
//         }
//       })
//     );
//   });
// }

// function fetchallcompanies() {
//   return firestore()
//     .collection("qbconfig")
//     .get();
// }
