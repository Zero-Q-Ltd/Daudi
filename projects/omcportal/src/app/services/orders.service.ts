import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { OrderCreate } from "app/models/Cloud/OrderCreate";
import { Order } from "app/models/Daudi/order/Order";
import { BehaviorSubject } from "rxjs";
import { FuelType } from 'app/models/Daudi/fuel/FuelType';

@Injectable({
  providedIn: "root"
})
export class OrdersService {

  queuedorders = new BehaviorSubject([]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private functions: AngularFireFunctions) {

  }

  createOrder(orderCteate: OrderCreate): Promise<any> {
    orderCteate.order.Id = this.db.createId();
    this.queuedorders.value.push(orderCteate.order.Id);
    // console.log(orderCteate);
    return this.functions.httpsCallable("createEstimate")(orderCteate).toPromise().then(value => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(orderCteate.order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
    }).catch(reason => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(orderCteate.order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
      console.error("error creating order", reason);
      /***
       * error creating order
       */
    });

  }

  approveOrder(orderCteate: OrderCreate): Promise<any> {
    // console.log(orderCteate);
    return this.functions.httpsCallable("createInvoice")(orderCteate).toPromise().then(value => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(orderCteate.order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
    }).catch(reason => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(orderCteate.order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
      console.log("error creating order", reason);
      /***
       * error creating order
       */
    });

  }

  updateorder(orderid: string, omcId: string, order: Order) {
    return this.ordersCollection(omcId)
      .doc(orderid)
      .update(order);
  }

  getOrder(orderid: string, omcId: string) {
    return this.ordersCollection(omcId)
      .doc(orderid);
  }
  searchDate(start: any, end: any, omcId: string) {
    return this.ordersCollection(omcId)
      .where("orderStageData.3.user.date", ">=", start)
      .where("orderStageData.3.user.date", "<=", end)
      .where("loaded", "==", true)

  }
  searchEntry(entry: string, fueltype: FuelType, omcId: string) {
    entry = entry.toUpperCase()
    return this.ordersCollection(omcId)
      .orderBy("fueltype." + fueltype + ".entries.entryIds")
      .startAt(entry)
      .endAt(entry + "\uf8ff")

  }

  searchCompany(name: string, omcId: string) {
    name = name.toUpperCase()
    return this.ordersCollection(omcId)
      .orderBy("customer.name")
      .startAt(name)
      .endAt(name + "\uf8ff")

  }
  searchOrders(paramName: string, value: string, omcId: string) {
    return this.ordersCollection(omcId)
  }

  ordersCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("orders");
  }

}
