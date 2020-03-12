import { firestore } from "firebase-admin";
import { OrderAction } from "../../../models/Cloud/OrderAction";
import { Order } from "../../../models/Daudi/order/Order";
import {
  Core,
  StatType,
  emptyCoreStat
} from "../../../models/Daudi/stats/Core";
import { TimeStats } from "../../../models/Daudi/stats/TimeStats";
import * as moment from "moment";
import { toObject } from "../../../models/utils/SnapshotUtils";
/**
 *
 * @param order
 * @param action
 * Function that sets the relevant stats into the database
 */
export function editStats(omcId: string, order: Order, action: OrderAction) {
  return firestore().runTransaction(async transaction => {
    console.log("Updating stats");
    const timeStats = firestore()
      .collection("omc")
      .doc(omcId)
      .collection("stats-time");

    const depotStats = firestore()
      .collection("omc")
      .doc(omcId)
      .collection("stats-depot");

    const yearQuery = timeStats
      .where("statType", "==", "Y")
      .where(
        "statType",
        "==",
        timeTypeValue("Y", order.orderStageData[3].user.date)
      );

    /**
     * Update logic cascading downwards to avoid conflics
     * Pssibly update logic
     */
    const monthQuery = timeStats
      .where("statType", "==", "M")
      .where(
        "statType",
        "==",
        timeTypeValue("M", order.orderStageData[3].user.date)
      );
    const weekQuery = timeStats
      .where("statType", "==", "W")
      .where(
        "statType",
        "==",
        timeTypeValue("W", order.orderStageData[3].user.date)
      );
    const dayQuery = timeStats
      .where("statType", "==", "D")
      .where(
        "statType",
        "==",
        timeTypeValue("D", order.orderStageData[3].user.date)
      );

    const daystat = await transaction.get(yearQuery);
    const weekstat = await transaction.get(monthQuery);
    const monthstat = await transaction.get(weekQuery);
    const yearstat = await transaction.get(dayQuery);
    /**
     * create arrays for the directory and the returned object for use in updating the relevant docs
     */
    const statsarray = [daystat, weekstat, monthstat, yearstat];
    if (action === "paid") {
      return statsarray.map((returnedstat, index) => {
        if (returnedstat.empty) {
          const TimeType = timeType(index);
          const newstat: TimeStats = {
            date: new Date(),
            customers: {
              new: 0
            },
            statType: TimeType,
            typeValue: Number(timeTypeValue(TimeType, moment().toDate())),
            stock: {
              pms: {
                accumulated: 0,
                created: 0
              },
              ago: {
                accumulated: 0,
                created: 0
              },
              ik: {
                accumulated: 0,
                created: 0
              }
            },
            entries: {
              pms: {
                created: 0
              },
              ago: {
                created: 0
              },
              ik: {
                created: 0
              }
            },
            id: "",
            orders: {
              voided: 0,
              paid: 1,
              exited: 0,
              discounted: 0,
              deleted: 0,
              created: 0,
              backend: order.origin === "backend" ? 1 : 0,
              frontend: order.origin === "frontend" ? 1 : 0
            },
            fuelsold: {
              ago: {
                amount: order.fuel.ago.priceconfig.total,
                qty: order.fuel.ago.qty
              },
              pms: {
                amount: order.fuel.pms.priceconfig.total,
                qty: order.fuel.pms.qty
              },
              ik: {
                amount: order.fuel.ik.priceconfig.total,
                qty: order.fuel.ik.qty
              }
            }
          };
          const id = timeStats.doc().id;
          newstat.id = id;
          return transaction.set(timeStats.doc(id), newstat);
        } else {
          const newstat: Core = toObject(emptyCoreStat, returnedstat.docs[0]);
          newstat.fuelsold = {
            pms: {
              qty: newstat.fuelsold.pms.qty + order.fuel.pms.qty,
              amount:
                newstat.fuelsold.pms.amount + order.fuel.pms.priceconfig.total
            },
            ago: {
              qty: newstat.fuelsold.ago.qty + order.fuel.ago.qty,
              amount:
                newstat.fuelsold.ago.amount + order.fuel.ago.priceconfig.total
            },
            ik: {
              qty: newstat.fuelsold.ik.qty + order.fuel.ik.qty,
              amount:
                newstat.fuelsold.ik.amount + order.fuel.ik.priceconfig.total
            }
          };
          return transaction.update(timeStats.doc(newstat.id), newstat);
        }
      });
    } else if (action === "deleted") {
      return statsarray.map((returnedstat, index) => {
        if (returnedstat.empty) {
          const newstat: Core = toObject(emptyCoreStat, returnedstat.docs[0]);
          newstat.fuelsold = {
            pms: {
              qty: newstat.fuelsold.pms.qty - order.fuel.pms.qty,
              amount:
                newstat.fuelsold.pms.amount - order.fuel.pms.priceconfig.total
            },
            ago: {
              qty: newstat.fuelsold.ago.qty - order.fuel.ago.qty,
              amount:
                newstat.fuelsold.ago.amount - order.fuel.ago.priceconfig.total
            },
            ik: {
              qty: newstat.fuelsold.ik.qty - order.fuel.ik.qty,
              amount:
                newstat.fuelsold.ik.amount - order.fuel.ik.priceconfig.total
            }
          };
          return transaction.update(timeStats.doc(newstat.id), newstat);
        } else {
          return Promise.reject("Invalid Document");
        }
      });
    } else {
      return Promise.resolve("Operation Logic todo");
    }
  });

  function timeType(index: number): StatType {
    switch (index) {
      case 0:
        return "D";
      case 1:
        return "W";
      case 2:
        return "M";
      default:
        return "Y";
    }
  }

  function timeTypeValue(statType: StatType, date: Date) {
    switch (statType) {
      case "D":
        return moment(date).format("DD");
      case "W":
        return moment(date).format("WW");
      case "M":
        return moment(date).format("MM");
      default:
        return moment(date).format("YYYY");
    }
  }
}
