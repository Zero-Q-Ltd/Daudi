import { Order_ } from "../../../models/Daudi/Order";
import * as admin from "firebase-admin";


export function creteOrder(order: Order_) {
    return admin.firestore().collection("depots").doc(order.config.depot.Id)
        .collection("orders")
        .doc(order.Id)
        .set(order)
}

export function updateOrder(depotId: string, orderId: string, data: Object) {
    return admin.firestore().collection("depots").doc(depotId)
        .collection("orders")
        .doc(orderId)
        .update(data)
}