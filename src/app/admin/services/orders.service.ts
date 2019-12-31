import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { emptyorder } from "../../models/Daudi/order/Order";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { OrderCreate } from "../../models/Cloud/OrderCreate";
import { Order } from "../../models/Daudi/order/Order";
import { ConfigService } from "./core/config.service";
import { CoreService } from "./core/core.service";
import { DepotService } from "./core/depot.service";
import { OmcService } from "./core/omc.service";


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
    private functions: AngularFireFunctions,
    private core: CoreService) {

  }

  createOrder(order: Order): Promise<any> {
    order.Id = this.db.createId();
    /**
     * add a counter for the number of pending orders in the queue
     */
    const orderdata: OrderCreate = {
      config: this.core.omcconfig.value,
      environment: this.core.environment.value,
      omcId: this.core.currentOmc.value.Id,
      order
    };
    this.queuedorders.value.push(order.Id);
    console.log(orderdata);

    return this.functions.httpsCallable("createEstimate")(orderdata).toPromise().then(value => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
    }).catch(reason => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
      console.error("error creating order", reason);
      /***
       * error creating order
       */
    });

  }
  approveOrder(order: Order): Promise<any> {
    const orderdata: OrderCreate = {
      config: this.core.omcconfig.value,
      environment: this.core.environment.value,
      omcId: this.core.currentOmc.value.Id,
      order
    };
    this.queuedorders.value.push(order.Id);
    console.log(orderdata);

    return this.functions.httpsCallable("createInvoice")(orderdata).toPromise().then(value => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
    }).catch(reason => {
      /**
       * delete the orderid after the operation is complete
       */
      const index = this.queuedorders.value.indexOf(order.Id);
      if (index > -1) {
        this.queuedorders.value.splice(index, 1);
      }
      console.log("error creating order", reason);
      /***
       * error creating order
       */
    });

  }



  updateorder(orderid: string, order: Order) {
    return this.db.firestore.collection("omc")
      .doc(this.core.currentOmc.value.Id)
      .collection("order")
      .doc(orderid).update(order);
  }

  getorder(orderid: string) {
    return this.db.firestore.collection("omc")
      .doc(this.core.currentOmc.value.Id)
      .collection("order")
      .doc(orderid);
  }

  getOrders(queryFn: QueryFn) {
    return this.db.collection<Order>("omc", queryFn)
      .doc(this.core.currentOmc.value.Id)
      .collection("order")
      .snapshotChanges()
      .pipe(map(t => {
        return {
          ...t.map(data => {
            return {
              ...emptyorder, ...{ Id: data.payload.doc.id }, ...data.payload.doc.data()
            };
          })
        };
      }
      ));
  }


}
