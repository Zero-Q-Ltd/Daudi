import { Invoice, ItemLine } from "../../../../models/Qbo/Invoice";
import { createQbo } from "../../../sharedqb";
import { Payment } from "../../../../models/Qbo/Payment";
import * as admin from "firebase-admin";
import * as moment from "moment";
import { fuelTypes } from "../../../../models/common";
import { Order } from "../../../../models/Daudi/order/Order";

function syncfueltypes(orderdata: Order): Array<any> {
  const fuels = ["pms", "ago", "ik"];
  const values: Array<ItemLine> = [];
  fuels.forEach(fuel => {
    if (orderdata.fuel[fuel].qty > 0) {
      values.push({
        Amount: orderdata.fuel[fuel].priceconfig.nonTaxprice * orderdata.fuel[fuel].qty,
        DetailType: "SalesItemLineDetail",
        Description: `VAT-Exempt : ${orderdata.fuel[fuel].priceconfig.nonTax} \t, Taxable Amount: ${orderdata.fuel[fuel].priceconfig.taxableAmnt} \t , VAT Total : ${orderdata.fuel[fuel].priceconfig.taxAmnt} \t`,
        SalesItemLineDetail: {
          ItemRef: {
            value: orderdata.fuel[fuel].QbId,
            name: "Inventory"
          },
          UnitPrice: orderdata.fuel[fuel].priceconfig.nonTaxprice,
          Qty: orderdata.fuel[fuel].qty,
          TaxCodeRef: {
            value: orderdata.config.sandbox ? "TAX" : "5"
          }
        }
      });
    }
  });
  return values;
}

function formulateInvoice(orderdata: Order): Invoice {
  const newInvoice: Invoice = {
    Balance: 0,
    TotalAmt: 0,
    CustomField: [{
      DefinitionId: "1",
      Name: "[Do not Edit!]",
      StringValue: `${orderdata.config.depot.Id}/${orderdata.Id}`,
      Type: "StringType"
    }, {
      DefinitionId: "2",
      Name: "Customer ID",
      StringValue: orderdata.company.QbId,
      Type: "StringType"
    }],
    EmailStatus: "NeedToSend",
    CustomerRef: {
      value: orderdata.company.QbId
    },
    BillEmail: {
      Address: orderdata.company.email
    },
    TxnTaxDetail: {
      TotalTax: orderdata.fuel.pms.priceconfig.taxAmnt + orderdata.fuel.ago.priceconfig.taxAmnt + orderdata.fuel.ik.priceconfig.taxAmnt,
      TxnTaxCodeRef: {
        value: orderdata.config.sandbox ? "TAX" : "5"
      },
      TaxLine: [{
        Amount: (orderdata.fuel.pms.priceconfig.taxAmnt + orderdata.fuel.ago.priceconfig.taxAmnt + orderdata.fuel.ik.priceconfig.taxAmnt),
        DetailType: "TaxLineDetail",
        TaxLineDetail: {
          NetAmountTaxable: orderdata.fuel.pms.priceconfig.taxableAmnt + orderdata.fuel.ago.priceconfig.taxableAmnt + orderdata.fuel.ik.priceconfig.taxableAmnt,
          PercentBased: false,
          TaxPercent: 8,
          TaxRateRef: {
            value: orderdata.config.sandbox ? '5' : '9'
          }
        }
      }]
    },
    AutoDocNumber: true,
    Line: syncfueltypes(orderdata)
  };
  /**
   * very bad temporary error
   */
  delete newInvoice.Balance
  delete newInvoice.TotalAmt
  return newInvoice;
}

export function createInvoice(orderdata: Order) {
  /**
   * format the timestamp again as it loses it when it doesnt directly go to the database
   */
  orderdata.stagedata["1"].user.time = moment().toDate() as any;
  return createQbo(orderdata.config.companyid).then(result => {
    const qbo = result;
    console.log("Not new company, checking for pending payments");

    const newInvoice = formulateInvoice(orderdata);
    console.log(newInvoice);
    return qbo.createInvoice(newInvoice).then(innerresult => {
      const invoiceresult: Invoice = innerresult.Invoice as Invoice;

      const Balance = innerresult.Invoice.Balance;
      if (Balance === 0) {
        console.log("Authorisation came from QB");
      }
      /**
       * Due to the limitation that you can't query payments by their unapplied amount, I will assume that the payment we are looking to link to this
       * Invoice is within the last 20 payments
       */
      return qbo.findPayments([
        { field: "CustomerRef", value: orderdata.company.QbId, operator: "=" },
        { field: "limit", value: 20 }
      ]).then(value => {
        const queriedpayments = value.QueryResponse.Payment || [];
        let invoicefullypaid = false;
        const validpayments: Array<{ payment: Payment, amount: number }> = [];
        let totalunapplied = 0;

        queriedpayments.forEach(payment => {
          totalunapplied += payment.UnappliedAmt;
          if (totalunapplied < invoiceresult.TotalAmt) {
            totalunapplied += payment.UnappliedAmt;
            validpayments.push({
              payment,
              // amount: (totalunapplied < invoiceresult.TotalAmt ? payment.UnappliedAmt : totalunapplied - invoiceresult.TotalAmt)
              amount: payment.UnappliedAmt
            });
          } else {
            console.log("Unused payments enough to pay for invoice");
            if (!invoicefullypaid) {
              validpayments.push({
                payment,
                // amount: (totalunapplied < invoiceresult.TotalAmt ? payment.UnappliedAmt : totalunapplied - invoiceresult.TotalAmt)
                amount: payment.UnappliedAmt
              });
              invoicefullypaid = true;
            } else {
              console.log("Accumulated unused payments already enough, skipping....");
              return;
            }
          }
        });

        if (validpayments.length > 0) {
          console.log(`Company has ${validpayments.length} unused payments`);
          // console.log(validpayments);
          const start = async () => {
            await asyncForEach(validpayments, async (paymentdetial) => {
              paymentdetial.payment.Line.push({
                Amount: paymentdetial.amount,
                LinkedTxn: [{
                  TxnId: invoiceresult.Id,
                  TxnType: "Invoice"
                }]
              });
              await qbo.updatePayment(paymentdetial.payment);
            });
            console.log("Done updating payments");
          };
          return start().then(linkivoiceresult => {
            const stagedata = {
              data: null,
              user: {
                name: "QBO",
                time: moment().toDate() as any,
                uid: "QBO"
              }
            };
            console.log(invoiceresult);
            orderdata.stagedata[invoicefullypaid ? 3 : 2] = stagedata;
            orderdata.QbId = invoiceresult.Id;
            orderdata.InvoiceId = invoiceresult.DocNumber || null;
            orderdata.stage = invoicefullypaid ? 3 : 2;
            return admin.firestore().collection("depots").doc(orderdata.config.depot.Id)
              .collection("orders")
              .doc(orderdata.Id)
              .set(orderdata).then(() => {
                console.log("success creating order");
                if (orderdata.notifications.allowemail) {
                  return qbo.sendInvoicePdf(invoiceresult.Id);
                } else {
                  return ("not sending email");
                }
              });
          });
        } else {
          console.log("Company doesn't have unused payments");
          orderdata.QbId = invoiceresult.Id;
          orderdata.InvoiceId = invoiceresult.DocNumber;
          orderdata.stage = 2;

          return admin.firestore().collection("depots").doc(orderdata.config.depot.Id)
            .collection("orders")
            .doc(orderdata.Id)
            .set(orderdata).then(() => {
              console.log("success creating order");
              if (orderdata.notifications.allowemail) {
                return qbo.sendInvoicePdf(invoiceresult.Id);
              } else {
                return ("not sending email");
              }
            });
        }
      });
      /**
       * TODO: Complete logic that handles failures due to simultaneous access
       */
    })
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
