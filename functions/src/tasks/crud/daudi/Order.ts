import * as admin from "firebase-admin";
import { Order } from "../../../models/Daudi/order/Order";


export function creteOrder(order: Order, omcId: string) {
    return orderDoc(order.Id, omcId)
        .set(order);
}

export function updateOrder(order: Order, omcId: string) {
    return orderDoc(order.Id, omcId)
        .update(order)
}

export function orderDoc(orderId: string, omcId: string) {
    return orderCollection(omcId)
        .doc(orderId)
}

export function orderCollection(omcId: string) {
    return admin.firestore()
        .collection("omc")
        .doc(omcId)
        .collection("orders")
}