import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { BehaviorSubject } from "rxjs";
import { OrderCreate } from "../../models/Cloud/OrderCreate";
import { Order } from "../../models/Daudi/order/Order";


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
    // order.Id = this.db.createId();

    this.queuedorders.value.push(orderCteate.order.Id);
    console.log(orderCteate);

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

    console.log(orderCteate);

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

  ordersCollection(omcId: string,
    //  environmnet: Environment
  ) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("order");
  }


}
