import { firestore } from "firebase-admin";
import { Order } from "../../models/Daudi/order/Order";
import { SMS } from "../../models/Daudi/sms/sms";

export function ordersms(order: Order, omcId: string) {
  /**
   * An order has been modified
   * Only sent an SMS if the stage has been incremented. Ignore stage 4 and 5 because another one will be sent for the truck
   * also ignore deleted orders
   */
  if (order.stage > 3) {
    return Promise.resolve("No SMS to send for order beyond stage 3");
  }
  const newsms: SMS = {
    Id: "",
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    greeting: "Hujambo",
    company: {
      QbId: order.customer.QbId,
      name: order.customer.name,
      Id: order.customer.Id,
      krapin: order.customer.krapin
    },
    contact: order.customer.contact,
    msg: resolveOrderText(order),
    type: {
      origin: "system",
      reason: "ordermoved"
    }
  };

  return firestore()
    .collection("omc")
    .doc(omcId)
    .collection("sms")
    .add(newsms);
}

export function trucksms(order: Order, omcId: string) {
  if (order.truck.stage > 3) {
    return Promise.resolve("Complete truck");
  }
  const newsms: SMS = {
    Id: "",
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    greeting: "Hujambo",
    company: order.customer,
    msg: resolveTrucksText(order),
    type: {
      origin: "system",
      reason: "ordermoved"
    },
    contact: order.customer.contact
  };
  return firestore()
    .collection("omc")
    .doc(omcId)
    .collection("sms")
    .add(newsms);
}

export function driverchangedsms(order: Order, omcId: string) {
  const text = ` ID ${order.customer.QbId} Truck#${order.QbConfig.InvoiceId} [DRIVER CHANGED] to ${order.truck.driverdetail.name}`;
  const newsms: SMS = {
    Id: null,
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    contact: order.customer.contact,
    greeting: "Hujambo",
    company: order.customer,
    msg: text,
    type: {
      origin: "system",
      reason: "truckchanges"
    }
  };
  return firestore()
    .collection("omc")
    .doc(omcId)
    .collection("sms")
    .add(newsms);
}

export function truckchangesdsms(order: Order, omcId: string) {
  const text = ` ID ${order.customer.QbId} Truck#${order.QbConfig.InvoiceId} [TRUCK CHANGED] to ${order.truck.truckdetail.numberplate}`;
  const newsms: SMS = {
    Id: null,
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    greeting: "Hujambo",
    company: order.customer,
    contact: order.customer.contact,
    msg: text,
    type: {
      origin: "system",
      reason: "truckchanges"
    }
  };
  return firestore()
    .collection("omc")
    .doc(omcId)
    .collection("sms")
    .add(newsms);
}

function resolveOrderText(order: Order): string {
  let text = ` ID ${order.customer.QbId}`;
  switch (order.stage) {
    case 1:
      text += ` Estimate# ${order.QbConfig.EstimateId} [SENT] for approval. Thank you for making it Emkay today.`;
      break;
    case 2:
      text +=
        `Order# ${order.QbConfig.InvoiceId} [INVOICED] awaiting payment of KES` +
        (order.fuel.pms.priceconfig.total +
          order.fuel.ago.priceconfig.total +
          order.fuel.ik.priceconfig.total);
      break;
    case 3:
      text += `Order# ${order.QbConfig.InvoiceId} [PAYMENT RECEIVED]. Thank you for making it Emkay today.`;
      break;
    case 4:
      /**
       * Send only the first and last seal numbers in the array
       */
      text += `Truck# ${order.QbConfig.InvoiceId} [PASSED]. Seal Numbers: ${order.seals.range[0]}-${order.seals.range[-1]}. Remember to always check your seals`;
      break;
    default:
      console.error(
        `Hii error ni ngori... Orderid ${order.Id}\n Order... ${order} `
      );
      break;
  }
  return (text += ` HELP:0733474703`);
}

function resolveTrucksText(order: Order): string {
  let text = ` ID ${order.customer.QbId} Truck#${order.QbConfig.InvoiceId}`;
  switch (order.truck.stage) {
    case 0:
      text +=
        " Your fuel is now [RESERVED] at " +
        order.config.depot.name +
        " Please collect within the next 36 hours. Thank you for making it Emkay today.";
      break;
    case 1:
      text +=
        " [ORDER SUBMITTED] at " +
        order.config.depot.name +
        " Est-Time " +
        order.truckStageData[1].expiry[0].expiry +
        " Thank you for making it Emkay today.";
      break;
    case 2:
      text += " [QUEUED] Est-Time " + order.truckStageData["2"].expiry[0].expiry;
      break;
    case 3:
      text += " [LOADING] Est-Time " + order.truckStageData["3"].expiry[0].expiry;
      break;
    default:
      console.error(
        `Hii error ni ngori... Orderid ${order.Id}\n Order... ${order} `
      );
      return "";
  }
  return (text += ` HELP:0733474703`);
}
