import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class OrderService {
  constructor(private db: AngularFirestore) {}

  getOrder(orderid: string) {
    return this.ordersCollection().where("Id", "==", orderid);
  }

  ordersCollection() {
    return this.db.firestore.collectionGroup("orders");
  }
}
