// import { QuickBooks } from "../../libs/qbmain";
// import { Bill } from "../../models/Qbo/Bill";
// import * as moment from "moment";
// import { firestore } from "firebase-admin";
// import { fuelTypes } from "../../models/common";
// import { Depot } from "../../models/Daudi/depot/Depot";
// import { Entry } from "../../models/Daudi/fuel/Entry";

// /**
//  * fetches all the batches that were created on that day, and adds them to db if they dont exist
//  * @param qbo
//  * @param since
//  */
// export function syncBatches(qbo: QuickBooks, since: firestore.Timestamp) {
//   return qbo
//     .findBills([
//       /**
//        * Get only the bills(Batch numbers) that have been fully paid
//        */
//       { field: "Balance", value: "1", operator: "<" },
//       { desc: "MetaData.LastUpdatedTime" },
//       /**
//        * Use the update time to compare with sync request time
//        */
//       {
//         field: "TxnDate",
//         value: moment()
//           .subtract(1, "day")
//           .startOf("day")
//           .format("YYYY-MM-DD"),
//         operator: ">="
//       }
//     ])
//     .then(billpayments => {
//       const allbillpayment =
//         (billpayments.QueryResponse.Bill as Array<Bill>) || [];
//       if (allbillpayment.length > 0) {
//         const validbillpayments = allbillpayment.filter(bill => {
//           return bill.Line[0].ItemBasedExpenseLineDetail
//             ? bill.Line[0].ItemBasedExpenseLineDetail.ItemRef.name.includes(":")
//             : false;
//         });
//         /**
//          *
//          */
//         return getaaldepots().then(alldepots => {
//           if (alldepots.empty) {
//             return new Promise(resolve => {
//               resolve(true);
//             });
//           } else {
//             const alldepotdata = alldepots.docs.map(
//               doc => doc.data() as Depot
//             );
//             return firestore().runTransaction(transaction => {
//               return Promise.all(
//                 validbillpayments.map(async payment => {
//                   const belongingdepot = alldepotdata.find(
//                     depot =>
//                       depot.Name ===
//                       payment.Line[0].ItemBasedExpenseLineDetail.ItemRef.name.split(
//                         ":"
//                       )[0]
//                   );
//                   const convertedbacth = covertbilltobatch(
//                     payment,
//                     belongingdepot
//                   );
//                   if (!convertedbacth || !belongingdepot) {
//                     return
//                   }
//                   const batchesdir = firestore()
//                     .collection("depots")
//                     .doc(convertedbacth.depot.Id)
//                     .collection("batches")
//                     .doc(convertedbacth.Id);
//                   const fetchedbatch = await transaction.get(batchesdir);
//                   if (!fetchedbatch.exists) {
//                     console.log("creating new batch");
//                     /**
//                      * Update the prices as well
//                      */
//                     await transaction.set(batchesdir, convertedbacth);
//                     // batchwrite.set(firestore().collection('depots').doc(batch.depot.Id).collection('batches').doc(batch.Id), batch);
//                     // fetchedDepot_.minpriceconfig[batch.type].price = batch.price;
//                     belongingdepot. [convertedbacth.type].price = convertedbacth.price;
//                     await transaction.update(
//                       firestore()
//                         .collection("depots")
//                         .doc(belongingdepot.Id),
//                       belongingdepot
//                     );
//                   } else {
//                     /**
//                      * else only update the price
//                      */
//                     console.log("Updating min prices only");
//                     belongingdepot.minpriceconfig[convertedbacth.type].price = convertedbacth.price;
//                     await transaction.update(
//                       firestore()
//                         .collection("depots")
//                         .doc(belongingdepot.Id),
//                       belongingdepot
//                     );
//                   }
//                 })
//               );
//             });
//           }
//         });
//       } else {
//         return new Promise(resolve => {
//           resolve(true);
//         });
//       }
//     });
// }

// function getaaldepots() {
//   return firestore()
//     .collection("depots")
//     .get();
// }

// function covertbilltobatch(convertedBill: Bill, belongingdepot: Depot | undefined): Entry | null {
//   console.log("converting bill to batch");
//   if (!belongingdepot) {
//     return null
//   }
//   // console.log(functionname, convertedBill);
//   const batchqty = convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty
//     ? convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty
//     : 0;
//   const fueltype = convertedBill.Line[0].ItemBasedExpenseLineDetail.ItemRef.name
//     .split(":")[1]
//     .toLowerCase() as fuelTypes;
//   const newEntry: Entry = {
//     Amount: convertedBill.Line[0].Amount ? convertedBill.Line[0].Amount : 0,
//     batch: convertedBill.DocNumber ? convertedBill.DocNumber : "Null",
//     depot: {
//       Id: belongingdepot.Id,
//       name: belongingdepot.Name
//     },
//     accumulated: {
//       total: 0,
//       usable: 0
//     },
//     Id: convertedBill.Id,
//     loadedqty: 0,
//     price: convertedBill.Line[0].ItemBasedExpenseLineDetail.UnitPrice
//       ? convertedBill.Line[0].ItemBasedExpenseLineDetail.UnitPrice
//       : 0,
//     qty: convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty
//       ? convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty
//       : 0,
//     runningcost: 0,
//     status: batchqty > 1 ? 1 : 0,
//     type: fueltype,
//     date: firestore.Timestamp.fromDate(new Date())
//   };
//   return newEntry;
// }
