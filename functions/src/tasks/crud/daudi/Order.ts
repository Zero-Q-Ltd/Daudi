import * as admin from "firebase-admin";
import { Order } from "../../../models/Daudi/order/Order";


export function creteOrder(order: Order, omcId: string) {
    return admin.firestore()
        .collection("omc")
        .doc(omcId)
        .collection("orders")
        .doc(order.Id)
        .set(order);
}

export function updateOrder(order: Order, omcId: string) {
    return admin.firestore()
        .collection("omc")
        .doc(omcId)
        .collection("orders")
        .doc(order.Id)
        .update(order)
}
