// import * as admin from "firebase-admin";
// import { Order } from "../../../models/Daudi/order/Order";


// export function creteOrder(order: Order) {
//     return admin.firestore().collection("depots").doc(order.config.depot.Id)
//         .collection("orders")
//         .doc(order.Id)
//         .set(order)
// }

// export function updateOrder(depotId: string, orderId: string, data: Object) {
//     return admin.firestore().collection("depots").doc(depotId)
//         .collection("orders")
//         .doc(orderId)
//         .update(data)
// }