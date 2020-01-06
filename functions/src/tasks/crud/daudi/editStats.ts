import {firestore} from "firebase-admin";
import * as moment from "moment";
import {OrderAction} from "../../../models/Cloud/OrderAction";
import {Order} from "../../../models/Daudi/order/Order";
import {Stat} from "../../../models/Daudi/stats/Stats";

/**
 *
 * @param order
 * @param action
 * Function that sets the relevant stats into the database
 */
export function editStats(order: Order, action: OrderAction) {
    return firestore().runTransaction(async transaction => {
        console.log("Updating stats");
        const yearstatsdir = firestore()
            .collection("depots")
            .doc(order.config.depot.id)
            .collection("stats")
            .doc(
                moment(order.stagedata["3"].user.time)
                    .utcOffset("+0300")
                    .startOf("year")
                    .format("YYYY")
            );
        /**
         * Add a 'w' to indicate that this is the week in case any numbers coincide
         */
        const weekstatsdir = firestore()
            .collection("depots")
            .doc(order.config.depot.id)
            .collection("stats")
            .doc(
                moment(order.stagedata["3"].user.time)
                    .utcOffset("+0300")
                    .startOf("week")
                    .format("YYYY-MM-WW") + "W"
            );
        const monthstatsdir = firestore()
            .collection("depots")
            .doc(order.config.depot.id)
            .collection("stats")
            .doc(
                moment(order.stagedata["3"].user.time)
                    .utcOffset("+0300")
                    .startOf("month")
                    .format("YYYY-MM")
            );
        const daytatsdir = firestore()
            .collection("depots")
            .doc(order.config.depot.id)
            .collection("stats")
            .doc(
                moment(order.stagedata["3"].user.time)
                    .utcOffset("+0300")
                    .startOf("day")
                    .format("YYYY-MM-DD")
            );
        const daystat = await transaction.get(daytatsdir);
        const weekstat = await transaction.get(weekstatsdir);
        const monthstat = await transaction.get(monthstatsdir);
        const yearstat = await transaction.get(yearstatsdir);
        /**
         * create arrays for the directory and the returned object for use in updating the relevant docs
         */
        const statsarray = [daystat, weekstat, monthstat, yearstat];
        const statsdirarray = [
            daytatsdir,
            weekstatsdir,
            monthstatsdir,
            yearstatsdir
        ];

        return statsarray.map((returnedstat, index) => {
            if (!returnedstat.exists) {
                const orderstatobject = {};
                orderstatobject[action] = 1;

                // orderstatobject[action] = 1;

                const newstat: Stat = {
                    date: moment(firestore.Timestamp.now().toDate())
                        .utcOffset("+0300")
                        .startOf("day")
                        .toDate(),
                    id: "",
                    orders: orderstatobject as any,
                    fuelsold: {
                        ago: {
                            amount: action === "paid" ? order.fuel.ago.priceconfig.total : 0,
                            qty: action === "paid" ? order.fuel.ago.qty : 0
                        },
                        pms: {
                            amount: action === "paid" ? order.fuel.pms.priceconfig.total : 0,
                            qty: action === "paid" ? order.fuel.pms.qty : 0
                        },
                        ik: {
                            amount: action === "paid" ? order.fuel.ik.priceconfig.total : 0,
                            qty: action === "paid" ? order.fuel.ik.qty : 0
                        }
                    }
                };
                return transaction.set(statsdirarray[index], newstat);
            } else {
                const newstat: Stat = Object.assign(
                    {},
                    { ...(returnedstat.data() as Stat) }
                );
                newstat.orders ? (newstat.orders[action] += 1) : null;
                /**
                 * If the stats object is pre-existing, there's a possibility this is a deletion
                 */

                switch (action) {
                    case "paid":
                        newstat.fuelsold
                            ? (newstat.fuelsold = {
                                pms: {
                                    qty: newstat.fuelsold.pms.qty + order.fuel.pms.qty,
                                    amount:
                                        newstat.fuelsold.pms.amount +
                                        order.fuel.pms.priceconfig.total
                                },
                                ago: {
                                    qty: newstat.fuelsold.ago.qty + order.fuel.ago.qty,
                                    amount:
                                        newstat.fuelsold.ago.amount +
                                        order.fuel.ago.priceconfig.total
                                },
                                ik: {
                                    qty: newstat.fuelsold.ik.qty + order.fuel.ik.qty,
                                    amount:
                                        newstat.fuelsold.ik.amount +
                                        order.fuel.ik.priceconfig.total
                                }
                            })
                            : null;
                        break;
                    case "deleted":
                        break;
                }
                return transaction.update(statsdirarray[index], newstat);
            }
        });
    });
    // batch.update(firestore().doc('depots').collection(order.config.depot.id).doc('stats').collection(order.stagedata['3'].user.time), )
}
