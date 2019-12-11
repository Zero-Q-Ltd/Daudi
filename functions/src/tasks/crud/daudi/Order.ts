import * as admin from "firebase-admin";
import { Order } from "../../../models/Daudi/order/Order";


export function creteOrder(order: Order, omcId: string) {
    return admin.firestore()
        .collection("omc")
        .doc(omcId)
        .collection("order")
        .doc(order.Id)
        .set(order);
}

// export function updateOrder(depotId: string, orderId: string, data: Object) {
//     return admin.firestore().collection("depots").doc(depotId)
//         .collection("order")
//         .doc(orderId)
//         .update(data)
// }