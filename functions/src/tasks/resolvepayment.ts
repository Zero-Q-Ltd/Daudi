// import { ipnmodel } from "../models/common";
// import { createQbo } from "./sharedqb";
// import { Invoice } from "../models/Qbo/Invoice";
// import { LineItems, Payment } from "../models/Qbo/Payment";
// import { firestore } from "firebase-admin";
// import * as moment from "moment";

// export function resolveipn(ipndetail: ipnmodel, ipnid: string): Promise<any> {
//   // console.log(ipndetail);
//   const proddbstring = "prodpayments";
//   const sandboxdbstring = "sandboxpayments";
//   const customerid = ipndetail.billNumber.toString();

//   if (ipndetail.daudiFields.status === 0) {
//     return new Promise(resolve => {
//       resolve(true);
//     });
//   } else {
//     return createQbo(ipndetail.daudiFields.companyid)
//       .then(result => {
//         const qbo = result;
//         /**
//          * Sort the invoices by the creation time so that there's a FIFO order
//          */
//         return qbo
//           .findInvoices([
//             { field: "CustomerRef", value: customerid, operator: "=" },
//             { field: "Balance", value: "0", operator: ">" },
//             { asc: "MetaData.CreateTime" }
//           ])
//           .then(invoicesresult => {
//             /**
//              * initialize the array in case empty
//              */
//             const allpendinginvoices: Array<Invoice> =
//               invoicesresult.QueryResponse.Invoice || [];
//             console.log(
//               `Customer has ${allpendinginvoices.length} pending invoices`
//             );
//             /**
//              * Make sure that we dont link more invoices to the amount than applicable
//              */
//             let invoicestotal = 0;
//             const applicableinvoices: Array<Invoice> = [];
//             allpendinginvoices.forEach(invoice => {
//               if (invoicestotal <= Number(ipndetail.billAmount)) {
//                 applicableinvoices.push(invoice);
//                 invoicestotal += invoice.Balance;
//               }
//             });

//             console.log(
//               `Customer has ${applicableinvoices.length} applicable invoices`
//             );
//             let appliedamount = 0;
//             if (applicableinvoices.length > 0) {
//               const payment: Payment = {
//                 PaymentRefNum: ipndetail.bankreference,
//                 CustomerRef: {
//                   value: customerid,
//                   name: ipndetail.debitcustname
//                 },
//                 /**
//                  * Loop through the applicable invoices and deduce how much is to be applied from the payment
//                  */
//                 Line: applicableinvoices.map(invoice => {
//                   let amountToapply = 0;
//                   if (
//                     invoice.Balance <=
//                     Number(ipndetail.billAmount) - appliedamount
//                   ) {
//                     amountToapply = invoice.Balance;
//                     appliedamount += invoice.Balance;
//                   } else {
//                     amountToapply =
//                       Number(ipndetail.billAmount) - appliedamount;
//                   }
//                   const line: LineItems = {
//                     Amount: amountToapply,
//                     LinkedTxn: [
//                       {
//                         TxnId: invoice.Id || '',
//                         TxnType: "Invoice" as "Invoice"
//                       }
//                     ]
//                   };
//                   return line;
//                 }),
//                 TotalAmt: Number(ipndetail.billAmount)
//               };
//               return qbo.createPayment(payment).then(innerresult => {
//                 const realpaymentResult = innerresult.Payment as Payment;
//                 if (!realpaymentResult.Line) {
//                   return true
//                 }
//                 const invoiceids = realpaymentResult.Line.map(
//                   (value, index, array) => {
//                     return getTransactionId(value);
//                   }
//                 );
//                 return qbo
//                   .findInvoices([{ Id: invoiceids }])
//                   .then(paidinvoicesresult => {
//                     const stagedata = {
//                       data: null,
//                       user: {
//                         name: "QBO",
//                         time: moment().toDate(),
//                         uid: "SPECIAL"
//                       }
//                     };
//                     const paidinvoices = paidinvoicesresult.QueryResponse
//                       .Invoice as Array<Invoice>;
//                     const Daurdi_IDs: Array<{
//                       depotid: string;
//                       orderid: string;
//                       stage: number;
//                     } | null> = paidinvoices.map((value, index, array) => {
//                       const field = value.CustomField
//                       if (field) {
//                         if (
//                           field[0] &&
//                           field[0].StringValue.split("/")[0] &&
//                           field[0].StringValue.split("/")[1]
//                         ) {
//                           return {
//                             /**
//                              * Update the stagedata in the order object
//                              * Important for stats
//                              */
//                             depotid: field[0].StringValue.split(
//                               "/"
//                             )[0],
//                             orderid: field[0].StringValue.split(
//                               "/"
//                             )[1],
//                             stage: value.Balance > 0 ? 2 : 3
//                           };
//                         } else {
//                           console.error(
//                             "This invoice doesnt have a valid daudi id attached to it"
//                           );
//                           /**
//                            * TODO : Figure out how to deal with this
//                            */
//                           return null;
//                         }
//                       } else {
//                         return null;
//                       }
//                       /**
//                        * this logic highly relies on custom fields being available, therefore we must check as this might be a source of error
//                        */

//                     });
//                     console.log(Daurdi_IDs);
//                     const batch = firestore().batch();
//                     ipndetail.daudiFields.status = 2;
//                     batch.update(
//                       firestore()
//                         .collection(
//                           ipndetail.daudiFields.sandbox
//                             ? sandboxdbstring
//                             : proddbstring
//                         )
//                         .doc(ipnid),
//                       ipndetail
//                     );

//                     Daurdi_IDs.forEach(idsobject => {
//                       if (idsobject) {
//                         batch.update(
//                           firestore()
//                             .collection("depots")
//                             .doc(idsobject.depotid)
//                             .collection("orders")
//                             .doc(idsobject.orderid),
//                           {
//                             stage: idsobject.stage,
//                             [`stagedata.${idsobject.stage}`]: stagedata
//                           }
//                         );
//                       } else {
//                         /**
//                          * TODO : Related to the todo above
//                          */
//                       }
//                     });
//                     return batch.commit().then(() => {
//                       console.log("successfuly created payment(s)");
//                       const start = async () => {
//                         await asyncForEach(
//                           paidinvoices,
//                           async (invoicedetial: { Id: string | undefined; }) => {
//                             await qbo.sendInvoicePdf(invoicedetial.Id);
//                           }
//                         );
//                       };
//                       return start().then(() => {
//                         return new Promise(res => {
//                           res("Done sending  payments");
//                         });
//                       });
//                     });
//                   });
//               });
//             } else {
//               const payment: Payment = {
//                 CustomerRef: {
//                   value: customerid,
//                   name: ipndetail.debitcustname
//                 },
//                 PaymentRefNum: ipndetail.bankreference,
//                 Line: [],
//                 TotalAmt: Number(ipndetail.billAmount)
//               };
//               return qbo.createPayment(payment).then(() => {
//                 ipndetail.daudiFields.status = 2;
//                 return firestore()
//                   .collection(
//                     ipndetail.daudiFields.sandbox
//                       ? sandboxdbstring
//                       : proddbstring
//                   )
//                   .doc(ipnid)
//                   .set(ipndetail);
//               });
//             }
//           });
//       })
//       .catch(error => {
//         console.error(error);
//         return;
//       });
//   }

//   function getTransactionId(value: LineItems): string {
//     const inv = value.LinkedTxn.find(value1 => value1.TxnType === "Invoice")
//     if (inv) {
//       return inv.TxnId
//     } else {
//       return ''
//     }
//   }
// }

// async function asyncForEach(array: any[] | Invoice[], callback: any) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }
