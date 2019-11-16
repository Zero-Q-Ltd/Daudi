import { firestore } from "firebase-admin";
import { Order_ } from "../../models/Daudi/Order";
import { SMS } from "../../models/Daudi/sms";
import { Truck_ } from "../../models/Daudi/Truck";
import * as moment from "moment";

export function ordersms(order: Order_) {
  /**
   * An order has been modified
   * Only sent an SMS if the stage has been incremented. Ignore stage 4 and 5 because another one will be sent for the truck
   * also ignore deleted orders
   */
  if (order.stage > 3) {
    return new Promise((resolver, reject) => {
      resolver("No SMS to send for order beyond stage 3");
    });
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
      QbId: order.company.QbId,
      contactname: order.company.contact.name,
      name: order.company.name,
      phone: order.company.contact.phone,
      Id: order.company.Id
    },
    msg: resolveOrderText(order),
    type: {
      origin: "system",
      reason: "ordermoved"
    }
  };

  return firestore()
    .collection("sms")
    .add(newsms);
}

export function trucksms(truck: Truck_) {
  const newsms: SMS = {
    Id: "",
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    greeting: "Hujambo",
    company: truck.company,
    msg: resolveTrucksText(truck),
    type: {
      origin: "system",
      reason: "ordermoved"
    }
  };
  return firestore()
    .collection("sms")
    .add(newsms);
}

export function driverchangedsms(truck: Truck_) {
  const text = ` ID ${truck.company.QbId} Truck#${truck.truckId} [DRIVER CHANGED] to ${truck.drivername}`;
  const newsms: SMS = {
    Id: null,
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    greeting: "Hujambo",
    company: truck.company,
    msg: text,
    type: {
      origin: "system",
      reason: "truckchanges"
    }
  };
  return firestore()
    .collection("sms")
    .add(newsms);
}

export function truckchangesdsms(truck: Truck_) {
  const text = ` ID ${truck.company.QbId} Truck#${truck.truckId} [TRUCK CHANGED] to ${truck.numberplate}`;
  const newsms: SMS = {
    Id: null,
    timestamp: firestore.Timestamp.fromDate(new Date()),
    status: {
      sent: false,
      delivered: false
    },
    greeting: "Hujambo",
    company: truck.company,
    msg: text,
    type: {
      origin: "system",
      reason: "truckchanges"
    }
  };
  return firestore()
    .collection("sms")
    .add(newsms);
}

function resolveOrderText(order: Order_): string {
  let text = ` ID ${order.company.QbId} Order# ${order.InvoiceId}`;
  switch (order.stage) {
    case 1:
      text += " [RECEIVED] Thank you for making it Emkay today.";
      break;
    case 2:
      text +=
        " [INVOICED] awaiting payment of KES" +
        (order.fuel.pms.priceconfig.total +
          order.fuel.ago.priceconfig.total +
          order.fuel.ik.priceconfig.total);
      break;
    case 3:
      text += " [PAYMENT RECEIVED]. Thank you for making it Emkay today.";
      break;
    case 4:
      // Excempt this stage from SMS coz a separate one will be sent fot the truck
      return "";
    // text += ' [LOADED]';

    default:
      console.error(
        `Hii error ni ngori... Orderid ${order.Id}\n Order... ${order} `
      );
      break;
  }
  return (text += ` HELP:0733474703`);
}

function resolveTrucksText(truck: Truck_): string {
  let text = ` ID ${truck.company.QbId} Truck#${truck.truckId}`;
  switch (truck.stage) {
    case 0:
      text +=
        " Your fuel is now [RESERVED] at " +
        truck.config.depot.name +
        " Please collect within the next 36 hours. Thank you for making it Emkay today.";
      break;
    case 1:
      text +=
        " [ORDER SUBMITTED] at " +
        truck.config.depot.name +
        " Est-Time " +
        truck.stagedata["1"].data.expiry[0].time +
        " Thank you for making it Emkay today.";
      break;
    case 2:
      text += " [QUEUED] Est-Time " + truck.stagedata["2"].data.expiry[0].time;
      break;
    case 3:
      text += " [LOADING] Est-Time " + truck.stagedata["3"].data.expiry[0].time;
      break;
    case 4:
      text +=
        " [PASSED] Seal Numbers: " +
        truck.stagedata["4"].data.seals.range +
        " Always check your seals";
      break;
    default:
      console.error(
        "The specified stage does not exist!!!!! You need to panic"
      );
      return "";
  }
  return (text += ` HELP:0733474703`);
}
